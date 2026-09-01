require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");

// DB se connect karo app start hote hi
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // JSON body parse karne ke liye
app.use(express.urlencoded({ extended: true }));

// Uploaded files ko static serve karne ke liye (dev ke liye theek hai, production me S3/Cloud storage use karo)
//app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "DocuLex API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (koi bhi controller me error throw hoga to yahan aayega)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DocuLex server running on port ${PORT}`);
});
