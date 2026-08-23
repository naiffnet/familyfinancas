const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables locally if running under electron or local testing
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

// Ensure DATA_ENCRYPTION_KEY is valid.
let hexKey = process.env.DATA_ENCRYPTION_KEY;
if (!hexKey || hexKey.length !== 64) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error("ERRO CRÍTICO DE SEGURANÇA: DATA_ENCRYPTION_KEY de 64 caracteres hexadecimais é obrigatória no ambiente de produção. Gere uma chave segura com 'node scripts/generate-keys.js'.");
  } else {
    console.warn("[Segurança] AVISO: DATA_ENCRYPTION_KEY não configurada ou inválida no .env. Utilizando chave derivativa local para desenvolvimento.");
  }
  // Deterministic 256-bit dev key derived from app secret string
  hexKey = crypto.createHash('sha256').update('financas-familia-default-dev-key').digest('hex');
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
    console.error("Erro ao criptografar campo:", err);
    throw new Error("Falha de segurança ao criptografar dados sensíveis.");
  }
}

function decryptField(payload) {
  if (!payload) return null;
  
  // If the payload doesn't look like base64, return as is (legacy plaintext).
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
