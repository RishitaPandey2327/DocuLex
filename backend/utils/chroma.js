const { ChromaClient } = require("chromadb");

// Ek hi client instance poore app me reuse hoga
const client = new ChromaClient({ path: process.env.CHROMA_URL || "http://localhost:8000" });

/**
 * Har contract ke liye apna alag ChromaDB "collection" banate hai (jaise ek alag table).
 * Isse ek contract ke chunks doosre contract ke chunks se mix nahi hote.
 */
async function getOrCreateCollection(collectionName) {
  return client.getOrCreateCollection({ name: collectionName });
}

/**
 * Chunks + unke embeddings ko ChromaDB me store karta hai.
 * @param {string} collectionName
 * @param {Array<{chunkId, text, pageNumber}>} chunks
 * @param {number[][]} embeddings - chunks ke saath same order me
 */
async function addChunksToCollection(collectionName, chunks, embeddings) {
  const collection = await getOrCreateCollection(collectionName);

  await collection.add({
    ids: chunks.map((c) => c.chunkId),
    embeddings,
    documents: chunks.map((c) => c.text),
    metadatas: chunks.map((c) => ({ pageNumber: c.pageNumber })),
  });

  return collection;
}

/**
 * Semantic similarity search - query embedding ke sabse "paas" ke chunks dhundta hai.
 * @param {string} collectionName
 * @param {number[]} queryEmbedding
 * @param {number} topK - kitne top results chahiye
 */
async function queryCollection(collectionName, queryEmbedding, topK = 4) {
  const collection = await getOrCreateCollection(collectionName);

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  // Chroma results ko ek simple, easy-to-use array me convert karte hai
  const documents = results.documents[0] || [];
  const metadatas = results.metadatas[0] || [];
  const distances = results.distances[0] || [];

  return documents.map((text, i) => ({
    text,
    pageNumber: metadatas[i]?.pageNumber,
    // distance jitni kam, chunk utna zyada relevant (semantic similarity)
    distance: distances[i],
  }));
}

module.exports = { getOrCreateCollection, addChunksToCollection, queryCollection };