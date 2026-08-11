import crypto from 'crypto';

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthSession {
  sessionId: string;
  code: string;
  botNumber: string;
  waLink: string;
  status: 'pending' | 'verified' | 'expired';
  createdAt: number;
  expiresAt: number;
  user?: User;
  token?: string;
}

// In-memory session store (TTL: 5 minutes)
const sessions = new Map<string, AuthSession>();
// Map verification code to sessionId for fast lookup when incoming message arrives
const codeToSessionId = new Map<string, string>();

// Default Bot WhatsApp Number (can be configured via env var WA_BOT_NUMBER)
const BOT_NUMBER = process.env.WA_BOT_NUMBER || '628152221622';
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a random 6-digit alphanumeric code (e.g. "AUTH-8921" or "892145")
 */
function generateAuthCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      codeToSessionId.delete(session.code);
      sessions.delete(sessionId);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredSessions, 60 * 1000);

export const waAuthService = {
  /**
   * Initiate a new WhatsApp Reverse Auth session
   */
  initiateSession(phoneHint?: string): AuthSession {
    cleanupExpiredSessions();

    const sessionId = crypto.randomUUID();
    let code = generateAuthCode();

    // Ensure code uniqueness
    while (codeToSessionId.has(code)) {
      code = generateAuthCode();
    }

    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;

    // Pre-filled message for WhatsApp
    const messageText = `LOGIN ${code}`;
    const encodedMessage = encodeURIComponent(messageText);
    const waLink = `https://wa.me/${BOT_NUMBER}?text=${encodedMessage}`;

    const session: AuthSession = {
      sessionId,
      code,
      botNumber: BOT_NUMBER,
      waLink,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    sessions.set(sessionId, session);
    codeToSessionId.set(code, sessionId);

    return session;
  },

  /**
   * Check status of an auth session
   */
  getSessionStatus(sessionId: string): AuthSession | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    if (session.status === 'pending' && session.expiresAt < Date.now()) {
      session.status = 'expired';
      codeToSessionId.delete(session.code);
    }

    return session;
  },

  /**
   * Handle incoming WhatsApp message from Baileys bot
   * Expected message format: "LOGIN 123456" or just "123456"
   */
  handleIncomingMessage(fromPhone: string, messageText: string): { success: boolean; session?: AuthSession; error?: string } {
    cleanupExpiredSessions();

    if (!messageText) {
      return { success: false, error: 'Empty message' };
    }

    // Extract 6-digit code from message
    const match = messageText.trim().match(/\b(\d{6})\b/);
    if (!match) {
      return { success: false, error: 'No valid 6-digit verification code found in message' };
    }

    const code = match[1];
    const sessionId = codeToSessionId.get(code);

    if (!sessionId) {
      return { success: false, error: 'Invalid or expired verification code' };
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.expiresAt < Date.now()) {
      session.status = 'expired';
      codeToSessionId.delete(code);
      return { success: false, error: 'Verification code has expired' };
    }

    // Format phone number (clean up @s.whatsapp.net if present from Baileys)
    const cleanPhone = fromPhone.replace(/@.*$/, '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('62')
      ? `+${cleanPhone}`
      : cleanPhone.startsWith('0')
      ? `+62${cleanPhone.slice(1)}`
      : `+${cleanPhone}`;

    // Create or resolve user
    const user: User = {
      id: `usr_${cleanPhone}`,
      phone: formattedPhone,
      name: `User ${cleanPhone.slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanPhone}`,
      createdAt: new Date().toISOString(),
    };

    const token = `jwt_${crypto.randomBytes(24).toString('hex')}`;

    session.status = 'verified';
    session.user = user;
    session.token = token;

    // Remove code from lookup so it cannot be reused
    codeToSessionId.delete(code);

    return { success: true, session };
  },

  /**
   * Mock verification for local development testing without running Baileys
   */
  mockVerify(sessionId: string, mockPhone: string = '+628123456789'): { success: boolean; session?: AuthSession; error?: string } {
    const session = sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.expiresAt < Date.now()) {
      session.status = 'expired';
      codeToSessionId.delete(session.code);
      return { success: false, error: 'Session expired' };
    }

    const cleanPhone = mockPhone.replace(/[^0-9]/g, '');
    const user: User = {
      id: `usr_${cleanPhone || 'demo'}`,
      phone: mockPhone,
      name: 'Demo User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanPhone || 'demo'}`,
      createdAt: new Date().toISOString(),
    };

    const token = `jwt_${crypto.randomBytes(24).toString('hex')}`;

    session.status = 'verified';
    session.user = user;
    session.token = token;

    codeToSessionId.delete(session.code);

    return { success: true, session };
  },
};
