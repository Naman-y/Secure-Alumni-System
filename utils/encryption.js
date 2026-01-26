const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.AES_KEY); // FIXED KEY

function encrypt(buffer) {
  const iv = crypto.randomBytes(16); // NEW IV PER FILE
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Store IV + encrypted data together
  return Buffer.concat([iv, encrypted]);
}

function decrypt(buffer) {
  // Extract IV (first 16 bytes)
  const iv = buffer.slice(0, 16);
  const encryptedData = buffer.slice(16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);

  return decrypted;
}

module.exports = { encrypt, decrypt };
