/*
 * No this is not secure, but it is the best we can do,
 * when the browser itself is decrypting the E-Mail.
 */
export const secretEmailKey = "argh-contact";

export function encryptEmail(emailAddress, encryptionKey = secretEmailKey) {
  const encrypted = [...utf8Bytes(emailAddress)].map((byte, index) => byte ^ encryptionKey.charCodeAt(index % encryptionKey.length));
  return bytesToBase64(encrypted);
}

export function decryptEmail(encryptedEmailAddress, encryptionKey = secretEmailKey) {
  const encrypted = base64ToBytes(encryptedEmailAddress);
  const decrypted = encrypted.map((byte, index) => byte ^ encryptionKey.charCodeAt(index % encryptionKey.length));
  return textFromUtf8Bytes(decrypted);
}

function utf8Bytes(value) {
  if (typeof Buffer !== "undefined") return Buffer.from(value, "utf8");
  return new TextEncoder().encode(value);
}

function textFromUtf8Bytes(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("utf8");
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function bytesToBase64(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  return globalThis.btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value) {
  if (typeof Buffer !== "undefined") return [...Buffer.from(value, "base64")];
  return Array.from(globalThis.atob(value), (character) => character.charCodeAt(0));
}
