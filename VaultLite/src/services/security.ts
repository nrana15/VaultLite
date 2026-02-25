const vaultKeyStorage = 'vaultlite.security.v1';

export interface SecurityConfig {
  enabled: boolean;
  passwordHash: string;
  inactivityMs: number;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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

export async function encryptText(plain: string, password: string): Promise<string> {
  const hash = await sha256(password);
  const seed = hash.slice(0, 8);
  return btoa(`${seed}:${plain}`);
}

export async function decryptText(cipher: string, password: string): Promise<string> {
  const hash = await sha256(password);
  const seed = hash.slice(0, 8);
  const decoded = atob(cipher);
  if (!decoded.startsWith(`${seed}:`)) throw new Error('Invalid password');
  return decoded.slice(seed.length + 1);
}
