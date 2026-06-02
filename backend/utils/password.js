import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password, passwordHash) => {
  const [algorithm, salt, key] = String(passwordHash || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !key) return false;

  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
};
