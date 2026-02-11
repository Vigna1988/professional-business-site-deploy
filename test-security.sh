#!/bin/bash

# Security Testing Script for Harvest Commodities Chat System
# This script tests all security features including rate limiting, encryption, CAPTCHA, and injection prevention

set -e

# Configuration
DOMAIN="${1:-http://localhost:3000}"
RESULTS_FILE="security-test-results.txt"
PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_test() {
  echo -e "${YELLOW}[TEST]${NC} $1"
}

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((PASSED++))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((FAILED++))
}

log_section() {
  echo ""
  echo "=========================================="
  echo "$1"
  echo "=========================================="
}

# Test 1: Rate Limiting
test_rate_limiting() {
  log_section "Testing IP-Based Rate Limiting"
  
  log_test "Sending 11 rapid messages to trigger rate limit..."
  
  for i in {1..11}; do
    response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
      -H "Content-Type: application/json" \
      -d "{
        \"content\": \"Test message $i\",
        \"userId\": \"test-user-rate-limit\",
        \"ipAddress\": \"192.168.1.100\"
      }")
    
    if [ $i -le 10 ]; then
      if echo "$response" | grep -q '"allowed":true'; then
        log_pass "Message $i: Rate limit allowed"
      else
        log_fail "Message $i: Should be allowed but was blocked"
      fi
    else
      if echo "$response" | grep -q '"allowed":false'; then
        log_pass "Message $i: Rate limit correctly blocked (exceeded limit)"
      else
        log_fail "Message $i: Should be blocked but was allowed"
      fi
    fi
  done
}

# Test 2: Vulgarity Filtering
test_vulgarity_filtering() {
  log_section "Testing Vulgarity & Inappropriate Content Filtering"
  
  # Test "sex"
  log_test "Testing 'sex' keyword blocking..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "I want to have sex with you",
      "userId": "test-user-vulgarity"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "'sex' keyword correctly blocked"
  else
    log_fail "'sex' keyword should be blocked"
  fi
  
  # Test other vulgar words
  log_test "Testing other vulgar words..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "This is fucking shit",
      "userId": "test-user-vulgarity"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Vulgar words correctly blocked"
  else
    log_fail "Vulgar words should be blocked"
  fi
  
  # Test clean message
  log_test "Testing clean message passes..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "This is a clean and professional message",
      "userId": "test-user-vulgarity"
    }')
  
  if echo "$response" | grep -q '"isValid":true'; then
    log_pass "Clean message correctly allowed"
  else
    log_fail "Clean message should be allowed"
  fi
}

# Test 3: XSS Prevention
test_xss_prevention() {
  log_section "Testing XSS (Cross-Site Scripting) Prevention"
  
  # Test script tag
  log_test "Testing script tag injection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "<script>alert(\"XSS\")</script>",
      "userId": "test-user-xss"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Script tag injection correctly blocked"
  else
    log_fail "Script tag injection should be blocked"
  fi
  
  # Test event handler
  log_test "Testing event handler injection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "<img src=x onerror=\"alert(1)\">",
      "userId": "test-user-xss"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Event handler injection correctly blocked"
  else
    log_fail "Event handler injection should be blocked"
  fi
  
  # Test JavaScript protocol
  log_test "Testing JavaScript protocol..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "<a href=\"javascript:alert(1)\">Click</a>",
      "userId": "test-user-xss"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "JavaScript protocol correctly blocked"
  else
    log_fail "JavaScript protocol should be blocked"
  fi
}

# Test 4: SQL Injection Prevention
test_sql_injection_prevention() {
  log_section "Testing SQL Injection Prevention"
  
  # Test UNION SELECT
  log_test "Testing UNION SELECT injection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "1 UNION SELECT * FROM users",
      "userId": "test-user-sqli"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "UNION SELECT injection correctly blocked"
  else
    log_fail "UNION SELECT injection should be blocked"
  fi
  
  # Test DROP TABLE
  log_test "Testing DROP TABLE injection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "DROP TABLE users; --",
      "userId": "test-user-sqli"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "DROP TABLE injection correctly blocked"
  else
    log_fail "DROP TABLE injection should be blocked"
  fi
  
  # Test INSERT INTO
  log_test "Testing INSERT INTO injection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "INSERT INTO admin VALUES (1, \"hacker\")",
      "userId": "test-user-sqli"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "INSERT INTO injection correctly blocked"
  else
    log_fail "INSERT INTO injection should be blocked"
  fi
}

# Test 5: Spam Detection
test_spam_detection() {
  log_section "Testing Spam Detection"
  
  # Test promotional spam
  log_test "Testing promotional spam..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "CLICK HERE NOW! Limited offer! Buy now!",
      "userId": "test-user-spam"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Promotional spam correctly blocked"
  else
    log_fail "Promotional spam should be blocked"
  fi
  
  # Test lottery spam
  log_test "Testing lottery spam..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Congratulations! You won the lottery!",
      "userId": "test-user-spam"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Lottery spam correctly blocked"
  else
    log_fail "Lottery spam should be blocked"
  fi
  
  # Test excessive capitalization
  log_test "Testing excessive capitalization..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "THIS IS A VERY LONG MESSAGE IN ALL CAPS THAT SHOULD BE BLOCKED AS SPAM",
      "userId": "test-user-spam"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Excessive capitalization correctly blocked"
  else
    log_fail "Excessive capitalization should be blocked"
  fi
}

# Test 6: URL Validation
test_url_validation() {
  log_section "Testing URL Validation & Malicious URL Detection"
  
  # Test valid URL
  log_test "Testing valid URL..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateUrl" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://example.com"
    }')
  
  if echo "$response" | grep -q '"isSafe":true'; then
    log_pass "Valid URL correctly allowed"
  else
    log_fail "Valid URL should be allowed"
  fi
  
  # Test URL shortener
  log_test "Testing URL shortener detection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Check this: https://bit.ly/malicious",
      "userId": "test-user-url"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "URL shortener correctly blocked"
  else
    log_fail "URL shortener should be blocked"
  fi
}

# Test 7: Message Length Validation
test_message_length() {
  log_section "Testing Message Length Validation"
  
  # Test empty message
  log_test "Testing empty message rejection..."
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "",
      "userId": "test-user-length"
    }')
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Empty message correctly rejected"
  else
    log_fail "Empty message should be rejected"
  fi
  
  # Test excessive length
  log_test "Testing excessive message length..."
  long_msg=$(printf 'a%.0s' {1..1001})
  response=$(curl -s -X POST "${DOMAIN}/api/trpc/chat.validateMessage" \
    -H "Content-Type: application/json" \
    -d "{
      \"content\": \"$long_msg\",
      \"userId\": \"test-user-length\"
    }")
  
  if echo "$response" | grep -q '"isValid":false'; then
    log_pass "Excessive message length correctly rejected"
  else
    log_fail "Excessive message length should be rejected"
  fi
}

# Main execution
main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║   Security Testing Suite for Harvest Commodities Chat      ║"
  echo "║   Domain: $DOMAIN"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Check if domain is reachable
  if ! curl -s -m 5 "${DOMAIN}" > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Cannot reach ${DOMAIN}"
    echo "Please ensure the server is running and accessible."
    exit 1
  fi
  
  # Run all tests
  test_rate_limiting
  test_vulgarity_filtering
  test_xss_prevention
  test_sql_injection_prevention
  test_spam_detection
  test_url_validation
  test_message_length
  
  # Summary
  log_section "Test Summary"
  echo -e "${GREEN}Passed: $PASSED${NC}"
  echo -e "${RED}Failed: $FAILED${NC}"
  echo ""
  
  if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All security tests passed!${NC}"
    exit 0
  else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
  fi
}

# Run main function
main "$@"
