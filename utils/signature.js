//Used for Hash + Digital Signature (Using SHA-256 hashing and RSA)
const crypto = require("crypto");

// Generate RSA keys (demo purpose)
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

function signData(data) {
  const hash = crypto.createHash("sha256").update(data).digest();
  const signature = crypto.sign("RSA-SHA256", hash, privateKey);
  return { hash, signature };
}

function verifySignature(data, signature) {
  const hash = crypto.createHash("sha256").update(data).digest();
  return crypto.verify("RSA-SHA256", hash, publicKey, signature);
}

module.exports = { signData, verifySignature };
