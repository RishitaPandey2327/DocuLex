const path = require("path");

/**
 * PDF se page-wise text extract karta hai.
 *
 * Ab PDF disk path se nahi,
 * directly uploaded Buffer se read hogi.
 *
 * Output:
 * {
 *   totalPages,
 *   pages: [
 *     {
 *       pageNumber,
 *       text
 *     }
 *   ]
 * }
 */

async function extractTextByPage(fileBuffer) {
  // pdfjs-dist ka legacy build ESM module hai,
  // isliye dynamic import use kar rahe hain.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Standard fonts ka path
  const standardFontDataUrl =
    path.join(
      path.dirname(require.resolve("pdfjs-dist/package.json")),
      "standard_fonts"
    ) + path.sep;

  // Buffer ko Uint8Array me convert karo
  const data = new Uint8Array(fileBuffer);

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

    // Saare text items ko ek readable string me join karo
    const pageText = textContent.items
      .map((item) => item.str)
      .join(" ")
      .trim();

    pages.push({
      pageNumber: pageNum,
      text: pageText,
    });
  }

  await loadingTask.destroy();

  return {
    totalPages,
    pages,
  };
}

module.exports = {
  extractTextByPage,
};
