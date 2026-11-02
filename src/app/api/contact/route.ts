import { NextResponse } from 'next/server';
import { saveContactMessage, getAllMessages, markMessageRead, getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Please provide your name, email, and message.' }, { status: 400 });
    }

    const saved = saveContactMessage({ name, email, subject, message });
    const settings = getSettings();

    // Read SMTP from environment variables (backend) or saved settings
    const smtpHost = process.env.SMTP_HOST || settings.smtpHost;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (settings.smtpPort || 587);
    const smtpUser = process.env.SMTP_USER || settings.smtpUser;
    const smtpPass = process.env.SMTP_PASS || settings.smtpPass;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || Boolean(settings.smtpSecure);

    // Send email dispatch if SMTP credentials exist
    let emailSent = false;
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"${name} (via Blog)" <${smtpUser}>`,
          to: settings.authorEmail || smtpUser,
          replyTo: email,
          subject: `[Blog Inquiry] ${subject || 'New Message'} from ${name}`,
          text: `You received a new message on your blog:\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nView all messages in your Author Portal: http://localhost:3000/admin`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Message on ${settings.siteTitle}</h2>
              <p><strong>From:</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
              <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <p style="white-space: pre-wrap; margin: 0; color: #1e293b;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #64748b;">You can reply directly to this email to contact ${name}.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailErr: any) {
        console.error('SMTP delivery error (message still preserved in dashboard):', mailErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your message has been sent to ${settings.authorName}.`,
      emailSent,
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
