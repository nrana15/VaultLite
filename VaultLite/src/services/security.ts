const vaultKeyStorage = 'vaultlite.security.v1';

export interface SecurityConfig {
  enabled: boolean;
  passwordHash: string;
  inactivityMs: number;
}

const PBKDF2_ITERATIONS = 120_000;
const KEY_LENGTH = 256;

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function toBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  const B = (globalThis as unknown as { Buffer?: { from: (x: Uint8Array) => { toString: (e: string) => string } } }).Buffer;
  if (!B) throw new Error('No base64 encoder available');
  return B.from(bytes).toString('base64');
}

function fromBase64(value: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(value);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }

  const B = (globalThis as unknown as { Buffer?: { from: (x: string, e: string) => Uint8Array } }).Buffer;
  if (!B) throw new Error('No base64 decoder available');
  return new Uint8Array(B.from(value, 'base64'));
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: asArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    base,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function setVaultPassword(password: string, inactivityMs = 5 * 60 * 1000) {
  const passwordHash = await sha256(password);
  const payload: SecurityConfig = { enabled: true, passwordHash, inactivityMs };
  localStorage.setItem(vaultKeyStorage, JSON.stringify(payload));
}

export function getSecurityConfig(): SecurityConfig | null {
  const raw = localStorage.getItem(vaultKeyStorage);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SecurityConfig;
  } catch {
    return null;
  }
}

export async function verifyVaultPassword(password: string): Promise<boolean> {
  const cfg = getSecurityConfig();
  if (!cfg?.enabled) return true;
  const hash = await sha256(password);
  return hash === cfg.passwordHash;
}

/**
 * Encoded format: v1:<salt_b64>:<iv_b64>:<cipher_b64>
 */
export async function encryptText(plain: string, password: string): Promise<string> {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt);

  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: asArrayBuffer(iv) },
    key,
    new TextEncoder().encode(plain),
  );

  return `v1:${toBase64(salt)}:${toBase64(iv)}:${toBase64(new Uint8Array(cipher))}`;
}

export async function decryptText(payload: string, password: string): Promise<string> {
  const [version, saltB64, ivB64, cipherB64] = payload.split(':');
  if (version !== 'v1' || !saltB64 || !ivB64 || !cipherB64) {
    throw new Error('Invalid encrypted payload format');
  }

  const salt = fromBase64(saltB64);
  const iv = fromBase64(ivB64);
  const cipher = fromBase64(cipherB64);
  const key = await deriveKey(password, salt);

  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: asArrayBuffer(iv) }, key, asArrayBuffer(cipher));
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error('Invalid password or corrupted payload');
  }
}
