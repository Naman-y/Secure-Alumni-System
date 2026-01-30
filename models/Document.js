const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  alumniEmail: String,
  encryptedPath: String,
  hash: Buffer,
  signature: Buffer,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Document", DocumentSchema);
