import { cookies } from 'next/headers';
import { getSettings } from './storage';

const AUTH_COOKIE_NAME = 'jwdr_admin_session';

export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(AUTH_COOKIE_NAME);
    if (!session || !session.value) return false;
    
    // In our simplified setup, session stores an auth token based on the admin password
    const settings = getSettings();
    const expectedToken = Buffer.from(`admin:${settings.adminPassword}`).toString('base64');
    return session.value === expectedToken;
  } catch {
    return false;
  }
}

export function generateAuthToken(password: string): string {
  return Buffer.from(`admin:${password}`).toString('base64');
}

export { AUTH_COOKIE_NAME };
