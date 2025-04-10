const { MongoClient, ObjectId } = require("mongodb");
const uri = "mongodb+srv://Piyumi:Piyu123@harvest-software.tgbx7.mongodb.net/?retryWrites=true&w=majority&appName=harvest-software"; // MongoDB URI

// Fetch all bids for a particular harvestId
const getBids = async (req, res) => {
  const { harvestId } = req.params;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Find all bids related to the given harvestId
    const bids = await collection.find({ harvestId: new ObjectId(harvestId) }).toArray();

    if (bids.length === 0) {
      return res.status(404).json({ message: "No bids found for this harvest." });
    }

    res.json(bids); // Respond with the list of bids
    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};

// Accept a bid
const acceptBid = async (req, res) => {
  const { bidId } = req.params;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Update the bid status to accepted
    const result = await collection.updateOne(
        { _id: new ObjectId(bidId) },
        { $set: { status: "Accepted" } }
      );
      
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Bid not found." });
    }

    res.json({ message: "Bid accepted successfully!" });
    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};

// Reject a bid
const rejectBid = async (req, res) => {
  const { bidId } = req.params;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db("harvest-sw");
    const collection = db.collection("bids");

    // Update the bid status to rejected
    const result = await collection.updateOne(
      { _id: ObjectId(bidId) },
      { $set: { status: "Rejected" } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Bid not found." });
    }

    res.json({ message: "Bid rejected successfully!" });
    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};

module.exports = { getBids, acceptBid, rejectBid };
