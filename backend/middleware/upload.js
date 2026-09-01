const multer = require("multer");
const path = require("path");

// File disk par kaha save hoga aur kaise naam milega
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // server.js already is /uploads ko static serve kar raha hai
  },
  filename: function (req, file, cb) {
    // Naam unique rakhne ke liye timestamp + original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Sirf PDF allow karo - koi bhi aur file type reject ho jayegi
// NOTE: Kai clients (jaise Postman) kabhi-kabhi sahi MIME type set nahi karte aur
// "application/octet-stream" bhej dete hai even for a valid PDF. Isliye hum MIME type
// ke saath-saath file extension bhi check karte hai - dono me se koi bhi match ho to accept.
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
  limits: { fileSize: 15 * 1024 * 1024 }, // max 15MB, contract PDFs generally itne me aa jate hai
});

module.exports = upload;