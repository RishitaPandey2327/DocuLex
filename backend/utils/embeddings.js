/**
 * Embeddings kya hote hai?
 * Ek embedding text ka numeric representation hai (jaise [0.02, -0.18, 0.73, ...] - 384
 * numbers ka array). Similar meaning wale text ke embeddings bhi "paas-paas" hote hai
 * vector space me. Isi property ka use karke hum semantic search karte hai - user ka
 * sawaal aur contract ka chunk agar meaning me similar hai, to unke embeddings bhi
 * similar honge, chahe exact words match na ho.
 *
 * Model: Xenova/all-MiniLM-L6-v2
 * - Ye Sentence-Transformers ka ek popular, lightweight model hai (384 dimensions)
 * - @xenova/transformers isse pure JavaScript/ONNX runtime me chalata hai - koi API key
 *   nahi chahiye, koi cost nahi, sab kuch local machine par chalta hai
 * - Trade-off: OpenAI jaise paid embedding models se thoda kam accurate hai, lekin
 *   student/learning project ke liye aur chhote-medium documents ke liye kaafi achha hai
 */

let embedderPromise = null;

// Model ek hi baar load hota hai (lazy singleton) - baar baar load karna slow hota
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }
  return embedderPromise;
}

/**
 * @param {string[]} texts - jitne bhi texts ke embeddings chahiye
 * @returns {Promise<number[][]>} - har text ke liye ek 384-length number array
 */
async function generateEmbeddings(texts) {
  const embedder = await getEmbedder();
  const embeddings = [];

  for (const text of texts) {
    // pooling: 'mean' aur normalize: true -> standard sentence embedding milta hai
    const output = await embedder(text, { pooling: "mean", normalize: true });
    embeddings.push(Array.from(output.data));
  }

  return embeddings;
}

module.exports = { generateEmbeddings };