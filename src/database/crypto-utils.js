const crypto = require('crypto');

// Load environment variables locally if running under electron or local testing
const fs = require('fs');
const path = require('path');
const dotenvPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(dotenvPath)) {
  const envContent = fs.readFileSync(dotenvPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
}

// Ensure DATA_ENCRYPTION_KEY is valid. Fallback to a zero-key for safe local testing if not defined.
let hexKey = process.env.DATA_ENCRYPTION_KEY;
if (!hexKey || hexKey.length !== 64) {
  console.warn("WARNING: DATA_ENCRYPTION_KEY not set or invalid. Using default development key.");
  hexKey = "0000000000000000000000000000000000000000000000000000000000000000";
}
const KEY = Buffer.from(hexKey, 'hex');

function encryptField(plainText) {
  if (!plainText) return null;
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
    const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  } catch (err) {
    console.error("Encryption error:", err);
    return plainText; // Fallback to plain text on encryption error to prevent system crash
  }
}

function decryptField(payload) {
  if (!payload) return null;
  
  // If the payload doesn't look like base64, return as is (could be legacy plaintext).
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(payload)) {
    return payload;
  }
  
  try {
    const raw = Buffer.from(payload, 'base64');
    if (raw.length < 28) return payload; // AES-GCM tag + IV is 28 bytes min
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch (err) {
    // Decryption failed (could be legacy plaintext field) - return as is!
    return payload;
  }
}

module.exports = { encryptField, decryptField };
