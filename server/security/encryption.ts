/**
 * Message Encryption and Secure Storage
 * Provides encryption/decryption for sensitive chat messages
 */

import crypto from "crypto";

// Use environment variable for encryption key, fallback to a default for development
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || 
  crypto.createHash("sha256").update("default-secure-key").digest();

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Encrypt a message
 */
export function encryptMessage(plaintext: string): string {
  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Encrypt the message
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = iv.toString("hex") + authTag.toString("hex") + encrypted;
    
    return combined;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt message");
  }
}

/**
 * Decrypt a message
 */
export function decryptMessage(encrypted: string): string {
  try {
    // Extract components
    const iv = Buffer.from(encrypted.slice(0, IV_LENGTH * 2), "hex");
    const authTag = Buffer.from(encrypted.slice(IV_LENGTH * 2, IV_LENGTH * 2 + TAG_LENGTH * 2), "hex");
    const encryptedData = encrypted.slice(IV_LENGTH * 2 + TAG_LENGTH * 2);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt message");
  }
}

/**
 * Hash a message for integrity verification
 */
export function hashMessage(message: string): string {
  return crypto
    .createHash("sha256")
    .update(message)
    .digest("hex");
}

/**
 * Verify message integrity
 */
export function verifyMessageIntegrity(message: string, hash: string): boolean {
  return hashMessage(message) === hash;
}

/**
 * Generate a secure token for user sessions
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string, salt?: Buffer): { hash: string; salt: string } {
  const passwordSalt = salt || crypto.randomBytes(SALT_LENGTH);
  
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 100000, 64, "sha512")
    .toString("hex");
  
  return {
    hash,
    salt: passwordSalt.toString("hex"),
  };
}

/**
 * Verify a password
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const saltBuffer = Buffer.from(salt, "hex");
  const { hash: newHash } = hashPassword(password, saltBuffer);
  
  return newHash === hash;
}

/**
 * Sanitize sensitive data from logs
 */
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = ["password", "token", "secret", "key", "apiKey", "email"];
  
  if (typeof data !== "object" || data === null) {
    return data;
  }
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }
  
  return sanitized;
}
