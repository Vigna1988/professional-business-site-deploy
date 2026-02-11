/**
 * Content Security Filter
 * Detects and filters spam, vulgarity, malicious links, and obscene content
 * Comprehensive security system for chat protection
 */

import { z } from "zod";

// Comprehensive list of vulgar, profane, and sexual content words
const VULGAR_WORDS = [
  // Strong profanities
  "fuck", "shit", "asshole", "motherfucker", "dickhead", "twat", "wanker",
  "cunt", "pussy", "bollocks", "arsehole", "bastard", "bitch",
  // Sexual content
  "sex", "porn", "xxx", "nude", "naked", "horny", "slut", "whore",
  "cock", "dick", "dildo", "vibrator", "orgasm", "ejaculate",
  // Drug references
  "cocaine", "heroin", "meth", "methamphetamine", "crack", "weed", "marijuana",
  // Extreme insults
  "retard", "idiot", "stupid", "dumb", "moron", "imbecile",
  // Racial/ethnic slurs (partial list for safety)
  "nigger", "faggot", "dyke", "spic", "chink", "gook", "kike",
  // Additional offensive terms
  "rape", "rapist", "pedophile", "pedo", "child abuse", "incest"
];

// Spam patterns and keywords
const SPAM_PATTERNS = [
  /(?:click\s+here|buy\s+now|limited\s+offer|act\s+now|free\s+money|order\s+now)/gi,
  /(?:congratulations|you\s+won|claim\s+prize|lottery|inheritance|jackpot)/gi,
  /(?:viagra|cialis|casino|poker|blackjack|slots|betting|gambling)/gi,
  /(?:weight\s+loss|diet\s+pill|miracle\s+cure|guaranteed|lose\s+weight)/gi,
  /(?:work\s+from\s+home|make\s+money\s+fast|easy\s+cash|get\s+rich)/gi,
  /(?:bitcoin|crypto|ethereum|nft|blockchain|defi|token)/gi,
  /(?:forex|trading|stock\s+tip|investment\s+opportunity)/gi,
  /(?:click\s+link|visit\s+site|download\s+now|install\s+app)/gi,
];

// URL patterns for malicious links
const MALICIOUS_URL_PATTERNS = [
  /(?:bit\.ly|tinyurl|short\.link|goo\.gl|ow\.ly|is\.gd)/gi, // URL shorteners
  /(?:phishing|malware|trojan|virus|ransomware|exploit)/gi, // Malware keywords
  /(?:\.tk|\.ml|\.ga|\.cf|\.gq)/gi, // Suspicious TLDs
  /(?:pastebin|pastie|hastebin)/gi, // Paste services often used for malware
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /(?:<script|javascript:|onerror=|onclick=|onload=)/gi, // XSS attempts
  /(?:union\s+select|drop\s+table|insert\s+into|delete\s+from)/gi, // SQL injection
  /(?:eval\(|exec\(|system\(|passthru\()/gi, // Code execution
  /(?:base64_decode|atob|decodeURIComponent)/gi, // Encoding/decoding (often used to hide malicious content)
];

// Rate limiting configuration
interface RateLimitEntry {
  count: number;
  resetTime: number;
  ipAddress?: string;
}

interface IPReputation {
  violations: number;
  lastViolation: number;
  blocked: boolean;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const ipReputationMap = new Map<string, IPReputation>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 10; // Max 10 messages per minute
const IP_BLOCK_THRESHOLD = 5; // Block after 5 violations
const IP_BLOCK_DURATION = 3600000; // 1 hour

/**
 * Validate and sanitize message content
 */
export function validateMessageContent(content: string): {
  isValid: boolean;
  sanitized: string;
  violations: string[];
} {
  const violations: string[] = [];
  let sanitized = content;

  // Check message length
  if (content.length === 0) {
    violations.push("Message cannot be empty");
    return { isValid: false, sanitized, violations };
  }

  if (content.length > 1000) {
    violations.push("Message exceeds maximum length of 1000 characters");
  }

  // Check for excessive whitespace/newlines (spam indicator)
  if (/\n{5,}/.test(content)) {
    violations.push("Excessive newlines detected");
  }

  // Check for repeated characters (spam indicator)
  if (/(.)\1{9,}/.test(content)) {
    violations.push("Excessive character repetition detected");
  }

  // Check for suspicious patterns (XSS, SQL injection, code execution)
  const suspiciousCheck = checkSuspiciousPatterns(content);
  if (suspiciousCheck.found) {
    violations.push(`Suspicious patterns detected: ${suspiciousCheck.patterns.join(", ")}`);
  }

  // Check for vulgarity
  const vulgarityCheck = checkVulgarity(content);
  if (vulgarityCheck.found) {
    violations.push(`Inappropriate language detected`);
    sanitized = vulgarityCheck.sanitized;
  }

  // Check for spam patterns
  const spamCheck = checkSpam(content);
  if (spamCheck.isSpam) {
    violations.push(`Spam detected: ${spamCheck.reason}`);
  }

  // Check for malicious URLs
  const urlCheck = checkMaliciousUrls(content);
  if (urlCheck.found) {
    violations.push(`Suspicious URLs detected`);
  }

  // Check for excessive URLs
  const urlCount = (content.match(/https?:\/\/\S+/gi) || []).length;
  if (urlCount > 3) {
    violations.push("Too many URLs in message");
  }

  // Check for email addresses (potential spam)
  const emailCount = (content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length;
  if (emailCount > 2) {
    violations.push("Too many email addresses in message");
  }

  // Check for phone numbers (potential spam)
  const phoneCount = (content.match(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []).length;
  if (phoneCount > 2) {
    violations.push("Too many phone numbers in message");
  }

  return {
    isValid: violations.length === 0,
    sanitized,
    violations,
  };
}

/**
 * Check for vulgarity and obscene language
 */
function checkVulgarity(content: string): {
  found: boolean;
  words: string[];
  sanitized: string;
} {
  const lowerContent = content.toLowerCase();
  const foundWords: string[] = [];
  let sanitized = content;

  for (const word of VULGAR_WORDS) {
    // Create regex to match word boundaries only
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(lowerContent)) {
      foundWords.push(word);
      // Replace with asterisks
      sanitized = sanitized.replace(
        new RegExp(`\\b${word}\\b`, "gi"),
        "*".repeat(word.length)
      );
    }
  }

  return {
    found: foundWords.length > 0,
    words: foundWords,
    sanitized,
  };
}

/**
 * Check for suspicious patterns (XSS, SQL injection, etc.)
 */
function checkSuspiciousPatterns(content: string): {
  found: boolean;
  patterns: string[];
} {
  const foundPatterns: string[] = [];

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      foundPatterns.push(pattern.source);
    }
  }

  return {
    found: foundPatterns.length > 0,
    patterns: foundPatterns,
  };
}

/**
 * Check for spam patterns and indicators
 */
function checkSpam(content: string): {
  isSpam: boolean;
  reason: string;
} {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isSpam: true,
        reason: "Spam keywords detected",
      };
    }
  }

  // Check for excessive capitalization (all caps)
  const upperRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperRatio > 0.7 && content.length > 10) {
    return {
      isSpam: true,
      reason: "Excessive capitalization",
    };
  }

  // Check for excessive punctuation
  const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
  if (punctuationRatio > 3) {
    return {
      isSpam: true,
      reason: "Excessive punctuation",
    };
  }

  return {
    isSpam: false,
    reason: "",
  };
}

/**
 * Check for malicious URLs
 */
function checkMaliciousUrls(content: string): {
  found: boolean;
  urls: string[];
} {
  const urls = content.match(/https?:\/\/\S+/gi) || [];
  const maliciousUrls: string[] = [];

  for (const url of urls) {
    for (const pattern of MALICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        maliciousUrls.push(url);
        break;
      }
    }
  }

  return {
    found: maliciousUrls.length > 0,
    urls: maliciousUrls,
  };
}

/**
 * Check rate limiting for spam prevention
 */
export function checkRateLimit(userId: string, ipAddress?: string): {
  allowed: boolean;
  remainingMessages: number;
  resetTime: number;
  blocked: boolean;
} {
  const now = Date.now();

  // Check IP reputation if provided
  if (ipAddress) {
    const ipRep = ipReputationMap.get(ipAddress);
    if (ipRep && ipRep.blocked && now < ipRep.lastViolation + IP_BLOCK_DURATION) {
      return {
        allowed: false,
        remainingMessages: 0,
        resetTime: ipRep.lastViolation + IP_BLOCK_DURATION,
        blocked: true,
      };
    }
  }

  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      ipAddress,
    };
    rateLimitMap.set(userId, newEntry);
    return {
      allowed: true,
      remainingMessages: RATE_LIMIT_MAX_MESSAGES - 1,
      resetTime: newEntry.resetTime,
      blocked: false,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_MESSAGES) {
    // Record violation for IP reputation
    if (ipAddress) {
      const ipRep = ipReputationMap.get(ipAddress) || { violations: 0, lastViolation: now, blocked: false };
      ipRep.violations++;
      ipRep.lastViolation = now;
      if (ipRep.violations >= IP_BLOCK_THRESHOLD) {
        ipRep.blocked = true;
      }
      ipReputationMap.set(ipAddress, ipRep);
    }

    return {
      allowed: false,
      remainingMessages: 0,
      resetTime: entry.resetTime,
      blocked: false,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remainingMessages: RATE_LIMIT_MAX_MESSAGES - entry.count,
    resetTime: entry.resetTime,
    blocked: false,
  };
}

/**
 * Validate URL safety
 */
export function validateUrl(url: string): {
  isValid: boolean;
  isSafe: boolean;
  reason?: string;
} {
  try {
    const urlObj = new URL(url);

    // Check for suspicious protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        isValid: false,
        isSafe: false,
        reason: "Invalid protocol",
      };
    }

    // Check for localhost or private IPs
    if (
      urlObj.hostname === "localhost" ||
      /^(127\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[01]\.)/i.test(
        urlObj.hostname
      )
    ) {
      return {
        isValid: true,
        isSafe: false,
        reason: "Private IP address",
      };
    }

    // Check for suspicious TLDs
    if (/\.(?:tk|ml|ga|cf|gq)$/i.test(urlObj.hostname)) {
      return {
        isValid: true,
        isSafe: false,
        reason: "Suspicious TLD",
      };
    }

    return {
      isValid: true,
      isSafe: true,
    };
  } catch {
    return {
      isValid: false,
      isSafe: false,
      reason: "Invalid URL format",
    };
  }
}

/**
 * Zod schema for validated chat messages
 */
export const ChatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message exceeds maximum length"),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Validate chat message with security checks
 */
export function validateChatMessage(message: ChatMessage): {
  isValid: boolean;
  sanitized: string;
  violations: string[];
} {
  return validateMessageContent(message.content);
}

/**
 * Clean up old rate limit entries and expired IP bans
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  const ipEntriesToDelete: string[] = [];
  
  rateLimitMap.forEach((entry, userId) => {
    if (now > entry.resetTime) {
      entriesToDelete.push(userId);
    }
  });
  
  ipReputationMap.forEach((rep, ip) => {
    if (now > rep.lastViolation + IP_BLOCK_DURATION) {
      ipEntriesToDelete.push(ip);
    }
  });
  
  entriesToDelete.forEach(userId => rateLimitMap.delete(userId));
  ipEntriesToDelete.forEach(ip => ipReputationMap.delete(ip));
}

/**
 * Get IP reputation status
 */
export function getIPReputation(ipAddress: string): IPReputation | null {
  return ipReputationMap.get(ipAddress) || null;
}

/**
 * Block an IP address manually
 */
export function blockIP(ipAddress: string, duration: number = IP_BLOCK_DURATION): void {
  const now = Date.now();
  ipReputationMap.set(ipAddress, {
    violations: IP_BLOCK_THRESHOLD,
    lastViolation: now,
    blocked: true,
  });
}

/**
 * Unblock an IP address
 */
export function unblockIP(ipAddress: string): void {
  ipReputationMap.delete(ipAddress);
}
