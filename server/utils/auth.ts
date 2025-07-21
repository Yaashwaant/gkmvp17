import { createHash, randomBytes } from 'crypto';
import { users, userSessions, type User, type UserSession } from '@shared/schema';
import { storage } from '../storage';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const testHash = createHash('sha256').update(password + salt).digest('hex');
  return testHash === hash;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30); // 30 days
  return expiry;
}

export async function createUserSession(userId: number): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpiry();
  
  // For memory storage, we'll track sessions in a Map
  if (!global.userSessions) {
    global.userSessions = new Map();
  }
  
  const session = {
    id: Date.now(), // Simple ID for memory storage
    userId,
    sessionToken,
    expiresAt,
    createdAt: new Date()
  };
  
  global.userSessions.set(sessionToken, session);
  
  return { sessionToken, expiresAt };
}

export async function verifySession(sessionToken: string): Promise<User | null> {
  if (!global.userSessions) {
    return null;
  }
  
  const session = global.userSessions.get(sessionToken);
  
  if (!session || session.expiresAt < new Date()) {
    if (session) {
      global.userSessions.delete(sessionToken);
    }
    return null;
  }
  
  const user = await storage.getUser(session.userId);
  return user || null;
}

export async function deleteSession(sessionToken: string): Promise<void> {
  if (global.userSessions) {
    global.userSessions.delete(sessionToken);
  }
}