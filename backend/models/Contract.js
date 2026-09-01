const mongoose = require("mongoose");

// Ye sirf METADATA store karta hai - contract ka naam, kiska hai, kitne pages hai, etc.
// Actual text chunks aur embeddings ChromaDB me jayenge (Phase 3), taaki dono DB apna-apna
// kaam kare: MongoDB = structured data, ChromaDB = vector search.
const contractSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String, // disk/uploads folder me actual naam jisse save hua
      required: true,
    },
    totalPages: {
      type: Number,
      default: 0,
    },
    // ChromaDB me is contract ke chunks ka collection/namespace identify karne ke liye
    chromaCollectionName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);