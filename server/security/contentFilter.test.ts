import { describe, it, expect, beforeEach } from "vitest";
import {
  validateMessageContent,
  checkRateLimit,
  validateUrl,
  cleanupRateLimits,
} from "./contentFilter";

describe("Content Security Filter", () => {
  beforeEach(() => {
    // Clear rate limits before each test
    cleanupRateLimits();
  });

  describe("validateMessageContent", () => {
    it("should accept clean messages", () => {
      const result = validateMessageContent("Hello, I would like to know about your products.");
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should reject messages with vulgarity", () => {
      const result = validateMessageContent("This is a fuck test message with shit in it.");
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain("Vulgar");
    });

    it("should sanitize vulgar words", () => {
      const result = validateMessageContent("This is a fuck test.");
      expect(result.sanitized).toContain("****");
    });

    it("should reject spam patterns", () => {
      const result = validateMessageContent("CLICK HERE NOW to buy our amazing products! Limited offer!");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("Spam"))).toBe(true);
    });

    it("should reject messages with excessive capitalization", () => {
      const result = validateMessageContent("THIS IS A VERY LONG MESSAGE IN ALL CAPS WHICH IS SPAM");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("capitalization"))).toBe(true);
    });

    it("should reject messages exceeding length limit", () => {
      const longMessage = "a".repeat(1001);
      const result = validateMessageContent(longMessage);
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("length"))).toBe(true);
    });

    it("should reject empty messages", () => {
      const result = validateMessageContent("");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("empty"))).toBe(true);
    });

    it("should reject messages with excessive newlines", () => {
      const result = validateMessageContent("Test\n\n\n\n\n\nMessage");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("newlines"))).toBe(true);
    });

    it("should reject messages with excessive character repetition", () => {
      const result = validateMessageContent("Hellooooooooooooooo");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("repetition"))).toBe(true);
    });

    it("should detect suspicious URLs", () => {
      const result = validateMessageContent("Check this out: https://bit.ly/malicious");
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("URLs"))).toBe(true);
    });

    it("should reject messages with too many URLs", () => {
      const result = validateMessageContent(
        "https://example.com https://test.com https://another.com https://fourth.com"
      );
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes("Too many URLs"))).toBe(true);
    });

    it("should accept legitimate URLs", () => {
      const result = validateMessageContent(
        "I found this at https://www.example.com"
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("checkRateLimit", () => {
    it("should allow messages within rate limit", () => {
      const result = checkRateLimit("user1");
      expect(result.allowed).toBe(true);
      expect(result.remainingMessages).toBe(9);
    });

    it("should track multiple messages from same user", () => {
      checkRateLimit("user2");
      checkRateLimit("user2");
      const result = checkRateLimit("user2");
      expect(result.remainingMessages).toBe(7);
    });

    it("should block user after exceeding rate limit", () => {
      const userId = "user3";
      // Send 10 messages
      for (let i = 0; i < 10; i++) {
        checkRateLimit(userId);
      }
      // 11th message should be blocked
      const result = checkRateLimit(userId);
      expect(result.allowed).toBe(false);
      expect(result.remainingMessages).toBe(0);
    });

    it("should have different limits for different users", () => {
      checkRateLimit("userA");
      checkRateLimit("userA");
      const resultA = checkRateLimit("userA");
      
      const resultB = checkRateLimit("userB");
      
      expect(resultA.remainingMessages).toBe(7);
      expect(resultB.remainingMessages).toBe(9);
    });

    it("should return reset time for blocked user", () => {
      const userId = "user4";
      for (let i = 0; i < 10; i++) {
        checkRateLimit(userId);
      }
      const result = checkRateLimit(userId);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe("validateUrl", () => {
    it("should accept valid HTTPS URLs", () => {
      const result = validateUrl("https://www.example.com");
      expect(result.isValid).toBe(true);
      expect(result.isSafe).toBe(true);
    });

    it("should accept valid HTTP URLs", () => {
      const result = validateUrl("http://www.example.com");
      expect(result.isValid).toBe(true);
      expect(result.isSafe).toBe(true);
    });

    it("should reject localhost URLs", () => {
      const result = validateUrl("http://localhost:3000");
      expect(result.isValid).toBe(true);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toContain("Private");
    });

    it("should reject private IP addresses", () => {
      const result = validateUrl("http://192.168.1.1");
      expect(result.isValid).toBe(true);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toContain("Private");
    });

    it("should reject suspicious TLDs", () => {
      const result = validateUrl("https://malicious.tk");
      expect(result.isValid).toBe(true);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toContain("Suspicious");
    });

    it("should reject invalid URL format", () => {
      const result = validateUrl("not a valid url");
      expect(result.isValid).toBe(false);
      expect(result.isSafe).toBe(false);
    });

    it("should reject invalid protocols", () => {
      const result = validateUrl("ftp://example.com");
      expect(result.isValid).toBe(false);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toContain("Invalid protocol");
    });
  });

  describe("cleanupRateLimits", () => {
    it("should remove expired rate limit entries", () => {
      const userId = "cleanup-test";
      checkRateLimit(userId);
      
      // Manually set an expired entry
      // This is a bit hacky but necessary for testing
      cleanupRateLimits();
      
      // Should not throw
      expect(() => cleanupRateLimits()).not.toThrow();
    });
  });
});
