const express = require("express");
const jwt = require("jsonwebtoken");
const Request = require("../models/Request");

const router = express.Router();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// 🧑‍🎓 ALUMNI CREATE REQUEST
router.post("/create", verifyToken, async (req, res) => {
  if (req.user.role !== "ALUMNI") {
    return res.status(403).json({ message: "Only alumni can request" });
  }

  const { documentType, reason } = req.body;

  const request = new Request({
    alumniEmail: req.user.email,
    documentType,
    reason
  });

  await request.save();

  res.json({ message: "Document request submitted" });
});

// 👨‍💼 ADMIN VIEW REQUESTS
router.get("/all", verifyToken, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin allowed" });
  }

  const requests = await Request.find({ status: "PENDING" });
  res.json(requests);
});

module.exports = router;
