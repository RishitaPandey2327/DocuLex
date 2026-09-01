const multer = require("multer");
const path = require("path");

// Render par local uploads folder use nahi karenge.
// File directly memory buffer me rahegi.
const storage = multer.memoryStorage();

// Sirf PDF allow karo
const fileFilter = (req, file, cb) => {
  const isPDF =
    file.mimetype === "application/pdf" ||
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (isPDF) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

module.exports = upload;
