import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both current password and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'New password must be at least 4 characters long.' }, { status: 400 });
    }

    const settings = getSettings();

    if (settings.adminPassword !== currentPassword) {
      return NextResponse.json({ success: false, error: 'Incorrect current password. Please try again.' }, { status: 400 });
    }

    saveSettings({ adminPassword: newPassword });

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully!'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to update password'
    }, { status: 500 });
  }
}
