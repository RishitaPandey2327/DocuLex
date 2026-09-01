/**
 * Ye woh "Clause Finder" feature hai jo original project spec me tha.
 *
 * IMPORTANT RAG CONCEPT: Hum har category ke liye ek natural-language QUESTION
 * likhte hai, keyword nahi. Kyu? Kyunki agar hum sirf "Termination" word search
 * karte (keyword search), to contract me agar likha ho "This agreement may be
 * brought to an end by either party..." (bina "termination" word use kiye), to
 * wo match nahi hota.
 *
 * Semantic search ke saath, hum "Under what conditions can this agreement be
 * terminated?" jaisa sawaal embed karte hai, aur uska embedding us contract ke
 * paragraph ke embedding ke "paas" hota hai chahe exact words match na ho -
 * kyunki dono ka MEANING similar hai.
 */
const CLAUSE_CATEGORIES = {
  Termination: "Under what conditions can this agreement be terminated by either party?",
  Payment: "What are the payment terms, salary, stipend, or compensation details?",
  Confidentiality: "What are the confidentiality and non-disclosure obligations?",
  Liability: "What are the liability and indemnification terms?",
  "Non-Compete": "What are the non-compete or restrictive covenant obligations?",
  Renewal: "What are the terms for renewing or extending this agreement?",
  "Intellectual Property": "Who owns the intellectual property created under this agreement?",
  "Dispute Resolution": "How are disputes or disagreements resolved under this agreement?",
};

module.exports = { CLAUSE_CATEGORIES };