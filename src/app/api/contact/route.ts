import { NextResponse } from 'next/server';
import { saveContactMessage, getAllMessages, markMessageRead, getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Please provide your name, email, and message.' }, { status: 400 });
    }

    const saved = saveContactMessage({ name, email, subject, message });
    const settings = getSettings();

    // If environment has a webhook/email endpoint (e.g., Formspree, Resend, or SMTP), dispatch here
    // For now, it is stored in the database and accessible via the author's admin panel

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your message has been sent to ${settings.authorName}.`,
      data: saved
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const messages = getAllMessages();
  return NextResponse.json({ success: true, messages });
}

export async function PATCH(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  const success = markMessageRead(id);
  return NextResponse.json({ success });
}
