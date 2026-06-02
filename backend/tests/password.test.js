// ─────────────────────────────────────────────────────────
//  Test: Password Utility (hashPassword & verifyPassword)
// ─────────────────────────────────────────────────────────
import { hashPassword, verifyPassword } from '../utils/password.js';

describe('Password Utility', () => {
  const plainPassword = 'MySecurePass@123';

  describe('hashPassword', () => {
    test('should return a scrypt-prefixed hash string', async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toBeDefined();
      expect(hash.startsWith('scrypt:')).toBe(true);

      const parts = hash.split(':');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('scrypt');
      expect(parts[1].length).toBeGreaterThan(0); // salt
      expect(parts[2].length).toBeGreaterThan(0); // derived key
    });

    test('should produce unique hashes for the same password (random salt)', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    test('should return true for a correct password', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await verifyPassword(plainPassword, hash);
      expect(result).toBe(true);
    });

    test('should return false for an incorrect password', async () => {
      const hash = await hashPassword(plainPassword);
      const result = await verifyPassword('WrongPassword!', hash);
      expect(result).toBe(false);
    });

    test('should return false for null/undefined hash', async () => {
      expect(await verifyPassword(plainPassword, null)).toBe(false);
      expect(await verifyPassword(plainPassword, undefined)).toBe(false);
    });

    test('should return false for malformed hash', async () => {
      expect(await verifyPassword(plainPassword, 'not-a-valid-hash')).toBe(false);
      expect(await verifyPassword(plainPassword, 'bcrypt:salt:key')).toBe(false);
    });
  });
});
