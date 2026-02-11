# Security Testing Guide

This guide provides comprehensive instructions for testing all security features implemented in the Harvest Commodities chat and quote system.

## Table of Contents

1. [IP-Based Rate Limiting](#ip-based-rate-limiting)
2. [Message Encryption](#message-encryption)
3. [CAPTCHA Verification](#captcha-verification)
4. [XSS/SQL Injection Prevention](#xsssql-injection-prevention)
5. [Bot Detection](#bot-detection)
6. [Vulgarity & Spam Filtering](#vulgarity--spam-filtering)
7. [Malicious URL Detection](#malicious-url-detection)
8. [Running Unit Tests](#running-unit-tests)

---

## IP-Based Rate Limiting

### What It Does
- Limits users to 10 messages per minute
- Tracks violations per IP address
- Automatically blocks IPs after 5 violations for 1 hour
- Prevents spam and abuse from single sources

### How to Test

#### Test 1: Basic Rate Limiting (Browser)
1. Open the website in your browser
2. Navigate to the Contact page
3. Try to send more than 10 messages rapidly in the chat widget
4. After the 10th message, you should see: "Too many messages. Please wait X seconds."
5. The input field should be disabled until the rate limit window resets (60 seconds)

#### Test 2: Rate Limiting via API (curl)
```bash
# Test endpoint: POST /api/trpc/chat.validateMessage
# Replace YOUR_DOMAIN with your actual domain

# Send 11 messages rapidly to trigger rate limit
for i in {1..11}; do
  curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Test message '$i'",
      "userId": "test-user-123",
      "ipAddress": "192.168.1.100"
    }' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
```

**Expected Results:**
- Messages 1-10: `"allowed": true`
- Message 11: `"allowed": false, "message": "Too many messages..."`

#### Test 3: IP Blocking
```bash
# Simulate 5 violations from same IP to trigger auto-block
for i in {1..5}; do
  # Send invalid content to trigger violations
  curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
    -H "Content-Type: application/json" \
    -d '{
      "content": "fuck shit damn",
      "userId": "attacker-'$i'",
      "ipAddress": "203.0.113.0"
    }' \
    -w "\nAttempt $i\n"
done

# Now try a normal message from the same IP - should be blocked
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Normal message",
    "userId": "attacker-6",
    "ipAddress": "203.0.113.0"
  }'
```

**Expected Result:** `"blocked": true, "message": "Your IP address has been temporarily blocked..."`

---

## Message Encryption

### What It Does
- Encrypts sensitive messages using AES-256-GCM
- Provides secure storage for chat data
- Generates secure tokens for user sessions
- Hashes passwords with PBKDF2 (100,000 iterations)

### How to Test

#### Test 1: Encryption/Decryption (Unit Tests)
```bash
cd /home/ubuntu/professional-business-site-deploy
pnpm test -- server/security/encryption.test.ts
```

#### Test 2: Message Integrity
The encryption system automatically verifies message integrity. To test:

1. Create a test file `test-encryption.mjs`:
```javascript
import { encryptMessage, decryptMessage, hashMessage, verifyMessageIntegrity } from './server/security/encryption.ts';

// Test encryption
const original = "Sensitive business information";
const encrypted = encryptMessage(original);
const decrypted = decryptMessage(encrypted);

console.log("Original:", original);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", original === decrypted);

// Test hashing
const hash = hashMessage(original);
console.log("Hash:", hash);
console.log("Verified:", verifyMessageIntegrity(original, hash));
console.log("Tampered:", verifyMessageIntegrity("Modified message", hash));
```

2. Run: `node test-encryption.mjs`

---

## CAPTCHA Verification

### What It Does
- Generates math-based CAPTCHA challenges
- Limits to 3 attempts per CAPTCHA
- Expires after 5 minutes
- Detects bot-like behavior

### How to Test

#### Test 1: CAPTCHA Challenge Generation
```bash
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.generateCaptcha \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "token": "abc123def456...",
  "challenge": "What is 5 + 3?",
  "options": ["8", "12", "6", "10"]
}
```

#### Test 2: CAPTCHA Verification
```bash
# First, generate a CAPTCHA
TOKEN=$(curl -s -X POST https://YOUR_DOMAIN/api/trpc/chat.generateCaptcha \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.token')

# Verify with correct answer
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.verifyCaptcha \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$TOKEN'",
    "answer": "8"
  }'
```

**Expected Response:**
```json
{
  "verified": true,
  "message": "CAPTCHA verified successfully"
}
```

#### Test 3: CAPTCHA Expiry
```bash
# Generate CAPTCHA
TOKEN=$(curl -s -X POST https://YOUR_DOMAIN/api/trpc/chat.generateCaptcha \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.token')

# Wait 5+ minutes, then try to verify
sleep 301
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.verifyCaptcha \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$TOKEN'",
    "answer": "8"
  }'
```

**Expected Response:**
```json
{
  "verified": false,
  "message": "CAPTCHA has expired. Please try again."
}
```

---

## XSS/SQL Injection Prevention

### What It Does
- Detects and blocks XSS (Cross-Site Scripting) attempts
- Detects and blocks SQL injection patterns
- Prevents code execution attacks
- Blocks suspicious encoding/decoding attempts

### How to Test

#### Test 1: XSS Attack Detection
```bash
# Test 1: Script tag injection
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<script>alert(\"XSS\")</script>",
    "userId": "test-user"
  }'

# Test 2: Event handler injection
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<img src=x onerror=\"alert(1)\">",
    "userId": "test-user"
  }'

# Test 3: JavaScript protocol
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<a href=\"javascript:alert(1)\">Click me</a>",
    "userId": "test-user"
  }'
```

**Expected Result:** All should return `"isValid": false` with violations containing "Suspicious patterns detected"

#### Test 2: SQL Injection Detection
```bash
# Test 1: UNION SELECT
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "1 UNION SELECT * FROM users",
    "userId": "test-user"
  }'

# Test 2: DROP TABLE
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "DROP TABLE users; --",
    "userId": "test-user"
  }'

# Test 3: INSERT INTO
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "INSERT INTO admin VALUES (1, \"hacker\", \"password\")",
    "userId": "test-user"
  }'
```

**Expected Result:** All should return `"isValid": false` with violations

#### Test 3: Code Execution Detection
```bash
# Test eval() execution
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "eval(atob(\"Y29uc29sZS5sb2coJ2hhY2tlZCcp\"))",
    "userId": "test-user"
  }'
```

**Expected Result:** `"isValid": false` with "Suspicious patterns detected"

---

## Bot Detection

### What It Does
- Identifies suspicious user agents (curl, wget, Python, etc.)
- Detects missing or unusual user agent strings
- Flags local/private IP addresses
- Prevents automated attacks

### How to Test

#### Test 1: Bot User Agent Detection
```bash
# Test with curl user agent (detected as bot)
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/7.68.0" \
  -d '{
    "content": "Normal message",
    "userId": "test-user"
  }'

# Test with Python user agent (detected as bot)
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -H "User-Agent: python-requests/2.28.0" \
  -d '{
    "content": "Normal message",
    "userId": "test-user"
  }'

# Test with normal browser user agent (should pass)
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{
    "content": "Normal message",
    "userId": "test-user"
  }'
```

#### Test 2: Missing User Agent
```bash
# Request without User-Agent header
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  --user-agent "" \
  -d '{
    "content": "Normal message",
    "userId": "test-user"
  }'
```

**Expected Result:** Bot detection should flag this as suspicious

---

## Vulgarity & Spam Filtering

### What It Does
- Blocks 50+ vulgar and inappropriate words (including "sex")
- Detects spam patterns (promotional, lottery, adult content, etc.)
- Prevents excessive capitalization, punctuation, and repetition
- Blocks email/phone spam

### How to Test

#### Test 1: Vulgarity Detection
```bash
# Test blocking of "sex"
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I want to have sex with you",
    "userId": "test-user"
  }'

# Test blocking of other vulgar words
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is fucking shit",
    "userId": "test-user"
  }'
```

**Expected Result:** `"isValid": false` with "Inappropriate language detected"

#### Test 2: Spam Detection
```bash
# Test promotional spam
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "CLICK HERE NOW! Limited offer! Buy now!",
    "userId": "test-user"
  }'

# Test lottery spam
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Congratulations! You won the lottery! Claim your prize!",
    "userId": "test-user"
  }'

# Test crypto spam
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Bitcoin ethereum NFT blockchain defi token",
    "userId": "test-user"
  }'
```

**Expected Result:** All should return `"isValid": false` with spam detection

#### Test 3: Excessive Capitalization
```bash
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "THIS IS A VERY LONG MESSAGE IN ALL CAPS THAT SHOULD BE BLOCKED",
    "userId": "test-user"
  }'
```

**Expected Result:** `"isValid": false` with "Excessive capitalization" violation

---

## Malicious URL Detection

### What It Does
- Detects URL shorteners (bit.ly, tinyurl, etc.)
- Blocks suspicious TLDs (.tk, .ml, .ga, .cf, .gq)
- Detects paste services (pastebin, pastie, hastebin)
- Validates URL safety

### How to Test

#### Test 1: URL Shortener Detection
```bash
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check this out: https://bit.ly/malicious",
    "userId": "test-user"
  }'
```

**Expected Result:** `"isValid": false` with "Suspicious URLs detected"

#### Test 2: Suspicious TLD Detection
```bash
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateMessage \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Visit https://malware.tk for free stuff",
    "userId": "test-user"
  }'
```

**Expected Result:** `"isValid": false` with "Suspicious URLs detected"

#### Test 3: URL Validation
```bash
curl -X POST https://YOUR_DOMAIN/api/trpc/chat.validateUrl \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

**Expected Response:**
```json
{
  "isValid": true,
  "isSafe": true
}
```

---

## Running Unit Tests

### Run All Tests
```bash
cd /home/ubuntu/professional-business-site-deploy
pnpm test
```

### Run Specific Test Files
```bash
# Content filter tests
pnpm test -- server/security/contentFilter.test.ts

# Quote submission tests
pnpm test -- server/quotes.submit.test.ts

# Auth tests
pnpm test -- server/auth.logout.test.ts
```

### Expected Test Results
```
Test Files  3 passed (3)
Tests  31 passed (31)
```

---

## Security Testing Checklist

Use this checklist to verify all security features:

- [ ] **Rate Limiting**: Can send 10 messages/minute, blocked on 11th
- [ ] **IP Blocking**: IP blocked after 5 violations
- [ ] **Message Encryption**: Messages encrypted with AES-256-GCM
- [ ] **CAPTCHA**: Math challenges generated and verified correctly
- [ ] **XSS Prevention**: Script tags and event handlers blocked
- [ ] **SQL Injection**: UNION SELECT, DROP TABLE, INSERT INTO blocked
- [ ] **Code Execution**: eval(), exec(), system() calls blocked
- [ ] **Bot Detection**: curl, wget, Python user agents detected
- [ ] **Vulgarity Filter**: "sex" and 50+ words blocked
- [ ] **Spam Detection**: Promotional, lottery, crypto spam blocked
- [ ] **URL Safety**: Shorteners, suspicious TLDs, paste services blocked
- [ ] **Unit Tests**: All 31 tests passing

---

## Troubleshooting

### Rate Limiting Not Working
- Check that `ipAddress` is being passed in the request
- Verify the rate limit window is 60 seconds (1 minute)
- Check browser console for any errors

### CAPTCHA Not Generating
- Ensure the endpoint is `/api/trpc/chat.generateCaptcha`
- Check that the response includes `token`, `challenge`, and `options`

### Encryption Tests Failing
- Verify the `CHAT_ENCRYPTION_KEY` environment variable is set
- Check that crypto module is properly imported
- Ensure Node.js version supports AES-256-GCM

### Bot Detection Not Working
- Verify the `User-Agent` header is being sent
- Check the bot pattern list in `server/security/captcha.ts`
- Ensure the detection logic is called before message validation

---

## Security Best Practices

1. **Monitor Rate Limits**: Regularly check for IPs hitting rate limits
2. **Review Blocked Messages**: Analyze blocked messages to improve filters
3. **Update Vulgar Words**: Periodically add new inappropriate words to the filter
4. **Rotate Encryption Keys**: Change `CHAT_ENCRYPTION_KEY` regularly
5. **Log Security Events**: Keep audit logs of all security violations
6. **Test Regularly**: Run this testing guide monthly to verify all features

---

## Contact & Support

For security issues or vulnerabilities, please contact the development team immediately.

**Last Updated:** February 11, 2026
**Version:** 1.0.0
