const { CloudClient } = require("chromadb");

// Chroma Cloud client - production me local server ke bajaye hosted service use karte hai.
// console.trychroma.com se free account bana ke API key, tenant, database name milega.
const client = new CloudClient({
  apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
});

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
/**
 * Kisi contract ki Chroma collection permanently delete karta hai.
 */
async function deleteCollection(collectionName) {
  return client.deleteCollection({
    name: collectionName,
  });
}

module.exports = {
  getOrCreateCollection,
  addChunksToCollection,
  queryCollection,
  deleteCollection,
};
