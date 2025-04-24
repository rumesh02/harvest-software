const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb+srv://Piyumi:Piyu123@harvest-software.tgbx7.mongodb.net/harvest-sw?retryWrites=true&w=majority";

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

    // Validate required fields
    const requiredFields = ['productId', 'productName', 'bidAmount', 'orderWeight', 'merchantId', 'merchantName', 'farmerId'];
    const missingFields = requiredFields.filter(field => !newBid[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields
      });
    }

    const result = await collection.insertOne(newBid);
    res.status(201).json({
      message: "Bid created successfully!",
      bid: { ...newBid, _id: result.insertedId }, // Include the inserted ID
    });
    client.close();

  } catch (error) {
    console.error("Error in createBid:", error); // Debugging
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};


// Accept a bid
const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    console.log("Accepting bid with ID:", bidId);

    // Validate bidId format
    if (!ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Use updateOne instead of findOneAndUpdate
    const result = await collection.updateOne(
      { _id: new ObjectId(bidId) },
      { 
        $set: { 
          status: "Accepted",
          updatedAt: new Date()
        } 
      }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      client.close();
      return res.status(404).json({ message: "Bid not found" });
    }

    client.close();
    res.json({ 
      message: "Bid accepted successfully",
      modifiedCount: result.modifiedCount
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
    console.log("Rejecting bid with ID:", bidId);

    // Validate bidId format
    if (!ObjectId.isValid(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID format" });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Use updateOne instead of findOneAndUpdate
    const result = await collection.updateOne(
      { _id: new ObjectId(bidId) },
      { 
        $set: { 
          status: "Rejected",
          updatedAt: new Date()
        } 
      }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      client.close();
      return res.status(404).json({ message: "Bid not found" });
    }

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
    const { farmerId } = req.query; // Get farmerId from query parameters

    const client = await MongoClient.connect(uri);
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Filter bids by farmerId if provided
    const query = farmerId ? { farmerId } : {};
    const bids = await collection.find(query).toArray();

    // Convert _id to string in the response
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
