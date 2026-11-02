import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const settings = getSettings();
  // Strip out sensitive backend credentials
  const { adminPassword, smtpPass, ...safeSettings } = settings;
  return NextResponse.json({ success: true, settings: safeSettings });
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    // Do not overwrite adminPassword from general settings PUT
    delete data.adminPassword;
    const updated = saveSettings(data);
    const { adminPassword, smtpPass, ...safeUpdated } = updated;
    return NextResponse.json({ success: true, settings: safeUpdated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}
