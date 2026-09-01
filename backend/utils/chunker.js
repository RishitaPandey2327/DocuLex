/**
 * Kyun chunk karte hai?
 * LLM ko poora 50-page contract har baar bhejna:
 *   - Expensive hai (zyada tokens)
 *   - Context window me fit nahi hota bade documents ke liye
 *   - Irrelevant info se answer quality kharab hoti hai
 *
 * Isliye document ko chhote-chhote "chunks" me todte hai, unke embeddings banate hai,
 * aur query time par sirf sabse relevant chunks (top-k) retrieve karke LLM ko dete hai.
 *
 * Overlap kyun rakha? Agar ek important sentence exactly do chunks ke beech me kat jaye
 * (jaise "30 days" ek chunk me aur "written notice" agle chunk me), to overlap na ho to
 * dono chunks apne aap me incomplete/confusing lagenge aur retrieval kharab hogi.
 */

const CHUNK_SIZE = 200; // words per chunk
const CHUNK_OVERLAP = 40; // words overlap between consecutive chunks

/**
 * @param {Array<{pageNumber: number, text: string}>} pages - pdfProcessor se aaya output
 * @param {string} contractId - kis contract ka chunk hai (metadata ke liye)
 * @returns {Array<{chunkId: string, contractId: string, pageNumber: number, text: string}>}
 */
function chunkPages(pages, contractId) {
  const allChunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    if (!page.text || page.text.trim().length === 0) continue; // blank pages skip

    const words = page.text.split(/\s+/);

    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + CHUNK_SIZE, words.length);
      const chunkText = words.slice(start, end).join(" ");

      allChunks.push({
        chunkId: `${contractId}-chunk-${chunkIndex}`,
        contractId,
        pageNumber: page.pageNumber,
        text: chunkText,
      });

      chunkIndex += 1;

      if (end === words.length) break; // last chunk of this page, move to next page

      start += CHUNK_SIZE - CHUNK_OVERLAP; // agla chunk overlap ke saath shuru hoga
    }
  }

  return allChunks;
}

module.exports = { chunkPages, CHUNK_SIZE, CHUNK_OVERLAP };
