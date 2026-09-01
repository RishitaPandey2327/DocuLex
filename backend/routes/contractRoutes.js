const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  uploadContract,
  getMyContracts,
  getContractById,
  searchContract,
  askQuestion,
  findClause,
  deleteContract,
} = require("../controllers/contractController");

// Phase 2 routes
router.post("/upload", protect, upload.single("contract"), uploadContract);
router.get("/", protect, getMyContracts);
router.get("/:id", protect, getContractById);
router.delete("/:id", protect, deleteContract);

// Phase 3 route - raw semantic search (debugging/testing)
router.post("/:id/search", protect, searchContract);

// Phase 4 routes - actual RAG Q&A
router.post("/:id/ask", protect, askQuestion);
router.get("/:id/clause/:category", protect, findClause);

module.exports = router;
