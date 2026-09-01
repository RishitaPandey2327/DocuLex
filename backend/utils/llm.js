const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Groq free tier me ye model available hai aur RAG jaise tasks ke liye kaafi accha hai
//const MODEL = "llama-3.1-8b-instant";
const MODEL = "openai/gpt-oss-20b";


/**
 * Ye function hi asli "RAG" ka final step hai:
 * Retrieved chunks (context) + user ka question -> LLM ko dono do -> grounded answer.
 *
 * IMPORTANT: System prompt me explicitly bola gaya hai ki LLM SIRF diye gaye context
 * se answer de, apne general knowledge se nahi. Isse "hallucination" (LLM ka khud se
 * kuch bana kar bol dena) control hota hai - ye RAG ka sabse important concept hai.
 *
 * @param {string} question - user ka sawaal
 * @param {Array<{text: string, pageNumber: number}>} chunks - retrieval se aaye top-k chunks
 * @returns {Promise<string>} - grounded answer
 */
async function generateGroundedAnswer(question, chunks) {
  if (!chunks || chunks.length === 0) {
    return "I couldn't find any relevant information in this contract to answer that question.";
  }

  // Context banate hai - har chunk ke saath uska page number bhi dete hai LLM ko,
  // taaki LLM chahe to apne answer me page reference bhi de sake
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1} - Page ${c.pageNumber}]\n${c.text}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are a contract analysis assistant. Answer the user's question using ONLY the information provided in the contract excerpts below. 

Rules:
- Do NOT use any outside knowledge or make assumptions beyond what is stated in the excerpts.
- If the excerpts do not contain enough information to answer the question, clearly say: "The contract does not appear to specify this."
- Keep your answer concise and factual (2-5 sentences).
- When relevant, mention which page the information came from (e.g., "as stated on Page 6").

Contract excerpts:
${context}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.2, // low temperature -> zyada factual/consistent answers, kam "creative"
    max_tokens: 500,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { generateGroundedAnswer };