const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const crypto = require('crypto'); // Added for PayHere hash generation
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const bidRoutes = require("./routes/bidRoutes");
const productsRoutes = require("./routes/productsRoutes");
const revenueRoutes = require('./routes/revenueRoutes');
const confirmedBidRoutes = require('./routes/confirmedBidRoutes');
//const Order = require('./models/orderModel');

dotenv.config();

const app = express();

// PayHere Hash Generator Function
const generatePayHereHash = (paymentData, merchantSecret) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code
  } = paymentData;

  const hashString = [
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase()
  ].join('');

  return crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase();
};

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

// Routes
app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/products", productsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/confirmedbids', confirmedBidRoutes);

// PayHere Notification Webhook
app.post('/api/payments/payhere-notify', async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('Received PayHere notification:', paymentData);

    // 1. Verify merchant ID
    if (paymentData.merchant_id !== process.env.PAYHERE_MERCHANT_ID) {
      console.error('Invalid merchant ID:', paymentData.merchant_id);
      return res.status(400).send("Invalid merchant");
    }

    // 2. Verify MD5 signature
    const expectedHash = generatePayHereHash(
      paymentData,
      process.env.PAYHERE_MERCHANT_SECRET
    );
    
    if (paymentData.md5sig !== expectedHash) {
      console.error('Invalid hash received');
      return res.status(400).send("Invalid hash");
    }

    // 3. Update database for successful payments (status_code 2)
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

      if (!updatedOrder) {
        console.error('Order not found:', paymentData.order_id);
        return res.status(404).send("Order not found");
      }

      console.log("Payment verified and order updated:", updatedOrder);
      // Add any additional post-payment processing here
    }

    res.status(200).send("Notification received");
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).send("Payment processing failed");
  }
});

// Hash Generation Endpoint (for frontend to get hash)
app.get('/api/payments/generate-hash', (req, res) => {
  try {
    const { orderId, amount, currency = "LKR" } = req.query;
    
    if (!orderId || !amount) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const hash = generatePayHereHash({
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      order_id: orderId,
      payhere_amount: amount,
      payhere_currency: currency,
      status_code: "2" // Using 2 as default for generation
    }, process.env.PAYHERE_MERCHANT_SECRET);

    res.json({ hash });
  } catch (error) {
    console.error('Hash generation error:', error);
    res.status(500).json({ error: "Hash generation failed" });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Test route
app.get("/api/test", (req, res) => {
  res.send("API is working!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start server with database connection check
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connection successful');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();