const path = require("path");
const Contract = require("../models/Contract");
const { extractTextByPage } = require("../utils/pdfProcessor");
const { chunkPages } = require("../utils/chunker");
const { generateEmbeddings } = require("../utils/embeddings");
const {
  addChunksToCollection,
  queryCollection,
  deleteCollection,
} = require("../utils/chroma");
const { generateGroundedAnswer } = require("../utils/llm");
const { CLAUSE_CATEGORIES } = require("../utils/clauseCategories");

// Shared helper: contract dhundo, ownership check karo, aur ready hai ya nahi check karo.
// searchContract, askQuestion, aur findClause teeno isi ko use karte hai - taaki
// same validation code baar baar na likhna pade.
async function getReadyContractOrThrow(contractId, userId) {
  const contract = await Contract.findOne({ _id: contractId, user: userId });
  if (!contract) {
    const err = new Error("Contract not found");
    err.statusCode = 404;
    throw err;
  }
  if (contract.status !== "completed") {
    const err = new Error(`Contract is not ready yet (status: ${contract.status})`);
    err.statusCode = 400;
    throw err;
  }
  return contract;
}

// Shared helper: query -> embedding -> ChromaDB se top-k relevant chunks
async function retrieveRelevantChunks(contract, query, topK = 4) {
  const [queryEmbedding] = await generateEmbeddings([query]);
  return queryCollection(contract.chromaCollectionName, queryEmbedding, topK);
}

// @route  POST /api/contracts/upload  (protected, multipart/form-data, field name: "contract")
const uploadContract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // Step 1: DB me ek entry banao pehle (taaki humein contractId mil jaye chunk-naming ke liye)
   // Memory storage use kar rahe hain,
// isliye multer filename provide nahi karega.
// Hum ek internal unique name generate kar rahe hain.
const uniqueFileName =
  Date.now() + "-" + Math.round(Math.random() * 1e9) + ".pdf";

const contract = await Contract.create({
  user: req.user._id,
  originalFileName: req.file.originalname,
  storedFileName: uniqueFileName,
  chromaCollectionName: `contract_${uniqueFileName.split(".")[0]}`,
  status: "processing",
});

   // Step 2: PDF se page-wise text nikalo
// PDF ab disk par save nahi ho rahi.
// Multer ne ise memory buffer me rakha hai.

const { totalPages, pages } = await extractTextByPage(req.file.buffer);

    // Step 3: Text ko overlapping chunks me todo
    const chunks = chunkPages(pages, contract._id.toString());

    if (chunks.length === 0) {
      contract.status = "failed";
      await contract.save();
      return res.status(422).json({
        message: "Could not extract readable text from this PDF (it might be a scanned/image-based PDF).",
      });
    }

    // Step 4: Har chunk ka embedding banao (local model, koi API key nahi chahiye)
    const embeddings = await generateEmbeddings(chunks.map((c) => c.text));

    // Step 5: Chunks + embeddings ko ChromaDB me store karo (metadata: pageNumber)
    await addChunksToCollection(contract.chromaCollectionName, chunks, embeddings);
    console.log("Chunks:", chunks.length);
console.log("Embeddings:", embeddings.length);
console.log("Embedding dimension:", embeddings[0]?.length);
console.log("Chroma collection:", contract.chromaCollectionName);

const collection = await require("../utils/chroma").getOrCreateCollection(
  contract.chromaCollectionName
);

console.log("Chroma document count:", await collection.count());

    // Step 6: Contract metadata update karo
    contract.totalPages = totalPages;
    contract.status = "completed";
    await contract.save();

    return res.status(201).json({
      message: "Contract uploaded and processed successfully",
      contract: {
        id: contract._id,
        originalFileName: contract.originalFileName,
        totalPages: contract.totalPages,
        totalChunks: chunks.length,
        status: contract.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while processing contract" });
  }
};

// @route  POST /api/contracts/:id/search  (protected) - Body: { "query": "..." }
// Pure semantic search - relevant chunks return karta hai, koi LLM answer nahi.
// Ye Phase 3 me retrieval verify karne ke liye banaya tha, ab bhi useful hai debugging ke liye.
const searchContract = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    const contract = await getReadyContractOrThrow(req.params.id, req.user._id);
    const results = await retrieveRelevantChunks(contract, query, 4);

    return res.status(200).json({ query, results });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Server error while searching contract" });
  }
};

// @route  POST /api/contracts/:id/ask  (protected) - Body: { "question": "..." }
// Ye asli RAG Q&A hai: retrieve top-k chunks -> LLM ko context ke saath do -> grounded answer.
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a question" });
    }

    const contract = await getReadyContractOrThrow(req.params.id, req.user._id);
    const chunks = await retrieveRelevantChunks(contract, question, 4);

    const answer = await generateGroundedAnswer(question, chunks);

    // Source pages ko duplicate hataake, sorted order me bhejte hai
    const sourcePages = [...new Set(chunks.map((c) => c.pageNumber))].sort((a, b) => a - b);

    return res.status(200).json({
      question,
      answer,
      sources: sourcePages.map((pageNumber) => ({
        pageNumber,
        // Us page ka pehla matching chunk snippet ke taur pe dikhate hai
        snippet: chunks.find((c) => c.pageNumber === pageNumber).text.slice(0, 200) + "...",
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Server error while answering question" });
  }
};

// @route  GET /api/contracts/:id/clause/:category  (protected)
// Predefined clause categories (Termination, Payment, etc.) - internally ye askQuestion
// jaisa hi kaam karta hai, bas question hum khud category se banate hai (clauseCategories.js dekho)
const findClause = async (req, res) => {
  try {
    const { category } = req.params;
    const predefinedQuestion = CLAUSE_CATEGORIES[category];

    if (!predefinedQuestion) {
      return res.status(400).json({
        message: `Unknown category. Valid categories: ${Object.keys(CLAUSE_CATEGORIES).join(", ")}`,
      });
    }

    const contract = await getReadyContractOrThrow(req.params.id, req.user._id);
    const chunks = await retrieveRelevantChunks(contract, predefinedQuestion, 4);

    const answer = await generateGroundedAnswer(predefinedQuestion, chunks);
    const sourcePages = [...new Set(chunks.map((c) => c.pageNumber))].sort((a, b) => a - b);

    return res.status(200).json({
      category,
      answer,
      sources: sourcePages.map((pageNumber) => ({
        pageNumber,
        snippet: chunks.find((c) => c.pageNumber === pageNumber).text.slice(0, 200) + "...",
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Server error while finding clause" });
  }
};

// @route  GET /api/contracts  (protected) - logged-in user ke saare contracts
const getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching contracts" });
  }
};

// @route  GET /api/contracts/:id  (protected)
const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, user: req.user._id });
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    return res.status(200).json(contract);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while fetching contract" });
  }
};

// @route DELETE /api/contracts/:id
// Logged-in user ka contract + uski Chroma collection delete karta hai.
const deleteContract = async (req, res) => {
  try {
    // Sirf current user's contract hi find hoga
    const contract = await Contract.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({
        message: "Contract not found",
      });
    }

    // Chroma collection delete karo
    // Agar collection already missing hai, MongoDB record phir bhi delete
    // karne denge, taaki orphaned contract na rahe.
    try {
      await deleteCollection(contract.chromaCollectionName);
    } catch (chromaError) {
      console.error("Chroma collection delete warning:", chromaError.message);
    }

    // MongoDB se contract metadata delete karo
    await Contract.deleteOne({
      _id: contract._id,
      user: req.user._id,
    });

    return res.status(200).json({
      message: "Contract deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error while deleting contract",
    });
  }
};
module.exports = {
  uploadContract,
  getMyContracts,
  getContractById,
  searchContract,
  askQuestion,
  findClause,
  deleteContract,
};
