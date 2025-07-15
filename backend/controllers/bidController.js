const { MongoClient, ObjectId } = require("mongodb");
const Notification = require('../models/Notification');

const uri = "mongodb+srv://Piyumi:Piyu123@harvest-software.tgbx7.mongodb.net/harvest-sw?retryWrites=true&w=majority";

// Create a bid
const createBid = async (req, res) => {
  const {
    productId,
    productName,
    bidAmount,
    orderWeight,
    merchantId,
    merchantName,
    merchantPhone,
    farmerId
  } = req.body;

  console.log("Incoming request body:", req.body); // Debugging

  try {
    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    const newBid = {
      productId,
      productName,
      bidAmount,
      orderWeight,
      merchantId,
      merchantName,
      merchantPhone,
      farmerId,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const requiredFields = ['productId', 'productName', 'bidAmount', 'orderWeight', 'merchantId', 'merchantName', 'farmerId'];
    const missingFields = requiredFields.filter(field => !newBid[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields
      });
    }

    const result = await collection.insertOne(newBid);

    const productsCollection = db.collection("products");
    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      client.close();
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate bid amount against product price
    if (Number(bidAmount) < Number(product.price)) {
      client.close();
      return res.status(400).json({ message: "Bid amount must be at least the farmer's listed price." });
    }

    // Validate order weight against available quantity
    const orderWeightNum = Number(orderWeight);
    const availableQuantity = Number(product.quantity);
    
    if (orderWeightNum <= 0) {
      client.close();
      return res.status(400).json({ message: "Order weight must be greater than 0." });
    }
    
    if (orderWeightNum > availableQuantity) {
      client.close();
      return res.status(400).json({ 
        message: `Order weight (${orderWeightNum} kg) cannot exceed available quantity (${availableQuantity} kg). Please reduce your order weight.`,
        availableQuantity: availableQuantity,
        requestedWeight: orderWeightNum
      });
    }

    res.status(201).json({
      message: "Bid created successfully!",
      bid: { ...newBid, _id: result.insertedId },
      updatedProduct: product
    });

    client.close();
  } catch (error) {
    console.error("Error in createBid:", error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};

// Accept a bid
const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    if (!ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const bidsCollection = db.collection("bids");
    const productsCollection = db.collection("products");
    
    // Get the global io instance
    const io = req.app.get('io');

    // Find the bid to get productId and orderWeight
    const bid = await bidsCollection.findOne({ _id: new ObjectId(bidId) });
    if (!bid) {
      client.close();
      return res.status(404).json({ message: "Bid not found" });
    }

    // Reduce product quantity by orderWeight, but not below zero
    const product = await productsCollection.findOne({ _id: new ObjectId(bid.productId) });
    if (!product) {
      client.close();
      return res.status(404).json({ message: "Product not found" });
    }
    const orderWeight = Number(bid.orderWeight) || 0;
    if (product.quantity < orderWeight) {
      client.close();
      return res.status(400).json({ message: "Not enough stock available to accept this bid." });
    }
    await productsCollection.updateOne(
      { _id: new ObjectId(bid.productId) },
      { $inc: { quantity: -orderWeight } }
    );

    // Update bid status
    const result = await bidsCollection.updateOne(
      { _id: new ObjectId(bidId) },
      {
        $set: {
          status: "Accepted",
          updatedAt: new Date()
        }
      }
    );

    // Get the updated product to return current quantity
    const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(bid.productId) });

    // Create notification for merchant when bid is accepted
    try {
      console.log('Creating notification for bid acceptance...');
      console.log('Bid details:', {
        merchantId: bid.merchantId,
        productName: bid.productName,
        bidAmount: bid.bidAmount,
        orderWeight: bid.orderWeight
      });
      
      const notification = new Notification({
        userId: bid.merchantId,
        title: '🎉 Your Bid was Accepted!',
        message: `Your bid of Rs. ${bid.bidAmount} per kg for ${bid.productName} has been accepted by the farmer.`,
        type: 'bid_accepted',
        relatedId: bidId,
        metadata: {
          bidId: bidId,
          productName: bid.productName,
          amount: bid.bidAmount * bid.orderWeight,
          farmerId: bid.farmerId,
          farmerName: 'Farmer' // You can get farmer name from users collection if needed
        }
      });
      
      const savedNotification = await notification.save();
      console.log('Notification saved successfully:', savedNotification);

      // Emit socket event for real-time notification updates
      if (io) {
        console.log('Emitting socket event for notification...');
        io.emit('newNotification', {
          userId: bid.merchantId,
          notification: savedNotification
        });
        console.log('Notification socket event emitted for:', bid.merchantId);
        
        // Also emit to specific user room if they're connected
        io.to(bid.merchantId).emit('newNotification', {
          userId: bid.merchantId,
          notification: savedNotification
        });
      } else {
        console.log('Socket IO instance not available');
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the bid acceptance if notification creation fails
    }

    client.close();
    
    // Emit socket event for real-time updates
    if (io) {
      io.emit('bidAccepted', {
        merchantId: bid.merchantId,
        productId: bid.productId,
        updatedProduct: updatedProduct
      });
    }
    
    res.json({
      message: "Bid accepted successfully",
      modifiedCount: result.modifiedCount,
      updatedProduct: updatedProduct,
      acceptedBid: {
        ...bid,
        status: "Accepted",
        _id: bidId
      }
    });

  } catch (error) {
    console.error("Error in acceptBid:", error);
    res.status(500).json({
      message: "Error accepting bid",
      error: error.message
    });
  }
};

// Reject a bid
const rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    if (!ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const bidsCollection = db.collection("bids");

    // Find the bid to get productId and orderWeight
    const bid = await bidsCollection.findOne({ _id: new ObjectId(bidId) });
    if (!bid) {
      client.close();
      return res.status(404).json({ message: "Bid not found" });
    }

    // Update bid status ONLY - do NOT change product quantity
    const result = await bidsCollection.updateOne(
      { _id: new ObjectId(bidId) },
      {
        $set: {
          status: "Rejected",
          updatedAt: new Date()
        }
      }
    );

    client.close();
    res.json({
      message: "Bid rejected successfully",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error in rejectBid:", error);
    res.status(500).json({
      message: "Error rejecting bid",
      error: error.message
    });
  }
};

// Get all bids for a specific farmer
const getBids = async (req, res) => {
  try {
    const { farmerId } = req.query;

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    const query = farmerId ? { farmerId } : {};
    const bids = await collection.find(query).toArray();

    const bidsWithStringId = bids.map(bid => ({
      ...bid,
      _id: bid._id.toString()
    }));

    res.json(bidsWithStringId);
    client.close();
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ message: "Error fetching bids", error: error.message });
  }
};

// Update bid status manually
const updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    const result = await collection.updateOne(
      { _id: new ObjectId(bidId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      client.close();
      return res.status(404).json({ message: "Bid not found" });
    }

    client.close();
    res.json({
      message: "Bid status updated successfully",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error updating bid status:", error);
    res.status(500).json({
      message: "Error updating bid status",
      error: error.message
    });
  }
};

module.exports = {
  createBid,
  acceptBid,
  rejectBid,
  getBids,
  updateBidStatus
};
