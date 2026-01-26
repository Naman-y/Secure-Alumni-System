const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

// TEMP in-memory storage (replace with DB later)
const users = [];
const otps = {};

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    name,
    email,
    password: hashedPassword,
    role
  });

  res.json({ message: "User registered successfully" });
});

// 🔹 LOGIN (STEP 1: PASSWORD)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid password" });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  otps[email] = otp;

  console.log("OTP (for demo):", otp); // 👈 OTP shown in terminal

  res.json({ message: "OTP sent to email (check server console)" });
});

// 🔹 VERIFY OTP (STEP 2: MFA)
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otps[email] != otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const user = users.find(u => u.email === email);

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  delete otps[email];

  res.json({ message: "Login successful", token });
});

// 🔹 ROLE-BASED PROTECTED ROUTE
router.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json({ message: "Welcome Admin Dashboard" });
});

// 🔹 JWT MIDDLEWARE
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Expected format: "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token format invalid" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}


module.exports = router;
