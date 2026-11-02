import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';
import { generateAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const settings = getSettings();

    if (password === settings.adminPassword) {
      const token = generateAuthToken(settings.adminPassword);
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
      
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to authenticate' }, { status: 500 });
  }
}
