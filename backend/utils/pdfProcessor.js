const path = require("path");
const fs = require("fs");

/**
 * Hum pdfjs-dist (Mozilla ki actively-maintained PDF library) use kar rahe hai text
 * extraction ke liye. Purani "pdf-parse" library kaafi outdated ho chuki hai aur
 * modern Node.js versions ke saath parsing errors deti hai, isliye pdfjs-dist better
 * choice hai - same engine jo Firefox ka PDF viewer use karta hai.
 *
 * Output: { totalPages, pages: [{ pageNumber, text }, ...] }
 * Har page ka text alag rakha gaya hai taaki baad me har chunk ke saath
 * "Source: Page X" bata sake (grounded answer ke liye zaroori hai).
 */
async function extractTextByPage(filePath) {
  // pdfjs-dist ka legacy build ESM module hai, isliye dynamic import() use kar rahe hai
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Standard fonts ka data path dena zaroori hai warna kuch PDFs me warning/errors aate hai
  const standardFontDataUrl =
    path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") +
    path.sep;

  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl,
  });

  const pdfDocument = await loadingTask.promise;
  const totalPages = pdfDocument.numPages;
  const pages = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Text items ko join karke ek readable paragraph banate hai
    const pageText = textContent.items.map((item) => item.str).join(" ").trim();

    pages.push({
      pageNumber: pageNum,
      text: pageText,
    });
  }

  await loadingTask.destroy();

  return { totalPages, pages };
}

module.exports = { extractTextByPage };
