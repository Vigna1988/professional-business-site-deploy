/**
 * Content Security Filter
 * Detects and filters spam, vulgarity, malicious links, and obscene content
 */

import { z } from "zod";

// Comprehensive list of strong vulgar and obscene words (avoiding false positives)
const VULGAR_WORDS = [
  "fuck", "shit", "asshole", "motherfucker", "dickhead", "twat", "wanker",
  "cunt", "pussy", "bollocks", "arsehole", "slut", "whore", "porn", "xxx"
];

// Spam patterns and keywords
const SPAM_PATTERNS = [
  /(?:click\s+here|buy\s+now|limited\s+offer|act\s+now|free\s+money)/gi,
  /(?:congratulations|you\s+won|claim\s+prize|lottery|inheritance)/gi,
  /(?:viagra|cialis|casino|poker|blackjack|slots)/gi,
  /(?:weight\s+loss|diet\s+pill|miracle\s+cure|guaranteed)/gi,
  /(?:work\s+from\s+home|make\s+money\s+fast|easy\s+cash)/gi,
];

// URL patterns for malicious links
const MALICIOUS_URL_PATTERNS = [
  /(?:bit\.ly|tinyurl|short\.link|goo\.gl)/gi, // URL shorteners
  /(?:phishing|malware|trojan|virus|ransomware)/gi, // Malware keywords
  /(?:\.tk|\.ml|\.ga|\.cf)/gi, // Suspicious TLDs
];

// Rate limiting configuration
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 10; // Max 10 messages per minute

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
  if (content.length > 1000) {
    violations.push("Message exceeds maximum length of 1000 characters");
  }

  // Check for empty messages
  if (!content.trim()) {
    violations.push("Message cannot be empty");
  }

  // Check for excessive whitespace/newlines (spam indicator)
  if (/\n{5,}/.test(content)) {
    violations.push("Excessive newlines detected");
  }

  // Check for repeated characters (spam indicator)
  if (/(.)\1{9,}/.test(content)) {
    violations.push("Excessive character repetition detected");
  }

  // Check for vulgarity
  const vulgarityCheck = checkVulgarity(content);
  if (vulgarityCheck.found) {
    violations.push(`Vulgar language detected: ${vulgarityCheck.words.join(", ")}`);
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
    violations.push(`Suspicious URLs detected: ${urlCheck.urls.join(", ")}`);
  }

  // Check for excessive URLs
  const urlCount = (content.match(/https?:\/\/\S+/gi) || []).length;
  if (urlCount > 3) {
    violations.push("Too many URLs in message");
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
    // Create regex to match word boundaries only (not variations)
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
export function checkRateLimit(userId: string): {
  allowed: boolean;
  remainingMessages: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    rateLimitMap.set(userId, newEntry);
    return {
      allowed: true,
      remainingMessages: RATE_LIMIT_MAX_MESSAGES - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      allowed: false,
      remainingMessages: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remainingMessages: RATE_LIMIT_MAX_MESSAGES - entry.count,
    resetTime: entry.resetTime,
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
    if (/\.(?:tk|ml|ga|cf)$/i.test(urlObj.hostname)) {
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
 * Clean up old rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  rateLimitMap.forEach((entry, userId) => {
    if (now > entry.resetTime) {
      entriesToDelete.push(userId);
    }
  });
  
  entriesToDelete.forEach(userId => rateLimitMap.delete(userId));
}
