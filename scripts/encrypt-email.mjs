#!/usr/bin/env node

import { encryptEmail, secretEmailKey } from "../assets/js/SecretEmailCipher.mjs";

const [email, key = secretEmailKey] = process.argv.slice(2);

if (!email || email === "--help" || email === "-h") {
  console.error(`Usage: scripts/encrypt-email.mjs <email> [key]\n\nEncrypts an email address for SecretEmailButton.\nDefault key: ${secretEmailKey}`);
  process.exit(email ? 0 : 1);
}

if (!isPlausibleEmailAddress(email)) {
  console.error("Expected a plausible email address, e.g. name@example.com");
  process.exit(1);
}

if (key.length === 0) {
  console.error("Key must not be empty");
  process.exit(1);
}

console.log(encryptEmail(email, key));

function isPlausibleEmailAddress(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}
