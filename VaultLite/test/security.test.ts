import { describe, expect, it } from 'vitest';
import { decryptText, encryptText } from '../src/services/security';

describe('security crypto', () => {
  it('encrypts and decrypts with AES-GCM payload format', async () => {
    const cipher = await encryptText('avaloq secret notes', 'strong-pass');
    expect(cipher.startsWith('v1:')).toBe(true);

    const plain = await decryptText(cipher, 'strong-pass');
    expect(plain).toBe('avaloq secret notes');
  });

  it('rejects wrong password', async () => {
    const cipher = await encryptText('sensitive', 'pass-A');
    await expect(decryptText(cipher, 'pass-B')).rejects.toThrow('Invalid password or corrupted payload');
  });
});
