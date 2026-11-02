import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSettings } from '@/lib/storage';

export async function GET() {
  const authed = isAuthenticated();
  const settings = getSettings();
  return NextResponse.json({
    authenticated: authed,
    authorName: settings.authorName,
    siteTitle: settings.siteTitle,
  });
}
