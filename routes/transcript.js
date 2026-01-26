const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
let signatureStore = {};

const { encrypt, decrypt } = require("../utils/encryption");
const { signData } = require("../utils/signature");
const jwt = require("jsonwebtoken");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔐 AUTH MIDDLEWARE
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// 📤 ADMIN UPLOAD TRANSCRIPT
router.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin allowed" });
  }

  const encrypted = encrypt(req.file.buffer);
  const { hash, signature } = signData(req.file.buffer);

  // store signature for verification
  signatureStore.signature = signature;

  const filePath = path.join("uploads", Date.now() + ".enc");
  fs.writeFileSync(filePath, encrypted);

  res.json({
    message: "Transcript uploaded securely",
    hash: hash.toString("hex"),
    signature: signature.toString("hex"),
  });
});

// 📥 ALUMNI DOWNLOAD TRANSCRIPT (BASE64)
router.get("/download", verifyToken, (req, res) => {

  // Only alumni allowed
  if (req.user.role !== "ALUMNI") {
    return res.status(403).json({ message: "Only alumni can download transcript" });
  }

  const uploadDir = "uploads";

  if (!fs.existsSync(uploadDir)) {
    return res.status(404).json({ message: "Uploads folder not found" });
  }

  const files = fs.readdirSync(uploadDir);

  if (files.length === 0) {
    return res.status(404).json({ message: "No transcript uploaded yet" });
  }

  const encryptedData = fs.readFileSync(`${uploadDir}/${files[0]}`);
  const decrypted = decrypt(encryptedData);

  const base64 = decrypted.toString("base64");

  res.json({
    message: "Transcript decrypted successfully",
    base64File: base64
  });
});

//Downlaod-original file route
router.get("/download-file", verifyToken, (req, res) => {

  // Only alumni allowed
  if (req.user.role !== "ALUMNI") {
    return res.status(403).json({ message: "Only alumni can download transcript" });
  }

  const uploadDir = "uploads";
  const files = fs.readdirSync(uploadDir);

  if (files.length === 0) {
    return res.status(404).json({ message: "No transcript available" });
  }

  const encryptedData = fs.readFileSync(`${uploadDir}/${files[0]}`);
  const decrypted = decrypt(encryptedData);

  // Send original file
  res.setHeader("Content-Disposition", "attachment; filename=transcript.pdf");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Type", "text/plain");


  res.send(decrypted);
});

//Add verifier Router
const { verifySignature } = require("../utils/signature");

router.get("/verify", verifyToken, (req, res) => {

  // Only staff allowed
  if (req.user.role !== "STAFF") {
    return res.status(403).json({ message: "Only staff can verify transcript" });
  }

  const uploadDir = "uploads";
  const files = fs.readdirSync(uploadDir);

  if (files.length === 0) {
    return res.status(404).json({ message: "No transcript available" });
  }

  const encryptedData = fs.readFileSync(`${uploadDir}/${files[0]}`);
  const decrypted = decrypt(encryptedData);

  // Verify signature
  const isValid = verifySignature(decrypted, signatureStore.signature);

  if (isValid) {
    res.json({ message: "Transcript is AUTHENTIC and NOT TAMPERED" });
  } else {
    res.json({ message: "Transcript has been TAMPERED" });
  }
});


module.exports = router;
