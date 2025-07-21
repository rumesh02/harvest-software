require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ObjectId } = require('mongodb');

const connectDB = require("./config/db");

// Models
const Order = require('./models/Order');
const ConfirmedBid = require('./models/ConfirmedBid');

// Routes
const userRoutes = require("./routes/userRoutes");
const bidRoutes = require("./routes/bidRoutes");
const productsRoutes = require("./routes/productsRoutes");
const revenueRoutes = require('./routes/farmerDashboardRoutes');
const confirmedBidRoutes = require('./routes/confirmedBidRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const farmerDashboardRoutes = require('./routes/farmerDashboardRoutes');
const geolocationRoutes = require('./routes/geolocationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const collectionRoutes = require("./routes/collectionRoutes");
const transporterdashboardRoutes = require('./routes/transporterdashboardRoutes'); // ✅ Conflict resolved here
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactRoutes = require('./routes/contactRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fileRoutes = require('./routes/fileRoutes');
const emojiRoutes = require('./routes/emojiRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const socketHandler = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://sandbox.payhere.lk"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('io', io);
socketHandler(io);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sandbox.payhere.lk"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/products", productsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/confirmedbids', confirmedBidRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api', locationRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use(farmerDashboardRoutes);
app.use('/api/dashboard', transporterdashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/emojis', emojiRoutes);
app.use('/api/reviews', reviewRoutes);

// PayHere Hash Generator Function
function generatePayHereHash({ merchant_id, order_id, amount, currency }, merchant_secret) {
  const formattedAmount = Number(amount).toFixed(2);
  const secretHash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
  const hashString = merchant_id + order_id + formattedAmount + currency + secretHash;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
}

// PayHere Webhook
app.post('/api/payments/payhere-notify', async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('Received PayHere notification:', paymentData);

    if (paymentData.merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error('Invalid merchant ID:', paymentData.merchant_id);
      return res.status(400).send("Invalid merchant");
    }

    const expectedHash = generatePayHereHash(paymentData, process.env.PAYHERE_MERCHANT_SECRET);
    if (paymentData.md5sig !== expectedHash) {
      console.error('Invalid hash received');
      return res.status(400).send("Invalid hash");
    }

    if (paymentData.status_code === "2") {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: paymentData.order_id },
        {
          paymentStatus: "completed",
          paymentId: paymentData.payment_id,
          amountPaid: paymentData.payhere_amount,
          currency: paymentData.payhere_currency,
          paymentDate: new Date()
        },
        { new: true }
      );

      const updatedConfirmedBid = await ConfirmedBid.findOneAndUpdate(
        { orderId: paymentData.order_id },
        {
          status: "paid",
          paymentMethod: "PayHere",
          paymentId: paymentData.payment_id,
          paymentAttempts: [{
            date: new Date(),
            status: "success",
            method: "PayHere"
          }]
        },
        { new: true }
      );

      if (updatedConfirmedBid?.bidId) {
        try {
          const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/harvest-sw";
          const client = await MongoClient.connect(uri);
          const db = client.db("harvest-sw");

          await db.collection("bids").updateOne(
            { _id: new ObjectId(updatedConfirmedBid.bidId) },
            { $set: { status: "Paid", updatedAt: new Date() } }
          );

          client.close();
          console.log(`Updated bid ${updatedConfirmedBid.bidId} status to Paid`);
        } catch (bidUpdateError) {
          console.error('Error updating bid:', bidUpdateError);
        }
      }

      if (!updatedOrder && !updatedConfirmedBid) {
        console.error('No order found with ID:', paymentData.order_id);
        return res.status(404).send("Order not found");
      }

      console.log("Payment processed:", { updatedOrder, updatedConfirmedBid });
    }

    res.status(200).send("Notification received");
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).send("Processing failed");
  }
});

// Hash Generator Endpoint
app.get('/api/payments/generate-hash', (req, res) => {
  try {
    const { orderId, amount, currency = "LKR" } = req.query;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!orderId || !amount) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const hash = generatePayHereHash({
      merchant_id,
      order_id: orderId,
      amount,
      currency
    }, merchant_secret);

    res.json({ hash, merchant_id });
  } catch (error) {
    console.error('Hash generation error:', error);
    res.status(500).json({ error: "Hash generation failed" });
  }
});

// Default Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.send("API is working!");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connection successful');
      console.log('Socket.IO server initialized');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
