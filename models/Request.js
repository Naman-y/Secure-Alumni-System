const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  alumniEmail: String,
  documentType: String,
  reason: String,
  status: {
    type: String,
    default: "PENDING"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Request", RequestSchema);
