import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const settings = getSettings();
  // Never expose adminPassword to public
  const authed = isAuthenticated();
  if (!authed) {
    const { adminPassword, ...publicSettings } = settings;
    return NextResponse.json({ success: true, settings: publicSettings });
  }
  return NextResponse.json({ success: true, settings });
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const updated = saveSettings(data);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}
