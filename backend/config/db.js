const mongoose = require("mongoose");

// Ye function server.js me call hoga app start hote hi.
// MongoDB Atlas ya local MongoDB dono ke liye kaam karega, bas .env me MONGO_URI sahi daalo.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // agar DB hi connect nahi hua to app start karne ka koi fayda nahi
  }
};

module.exports = connectDB;
