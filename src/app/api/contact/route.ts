import { NextResponse } from 'next/server';
import { saveContactMessage, getAllMessages, markMessageRead, getSettings, getCloudMessages } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Please provide your name, email, and message.' },
        { status: 400 }
      );
    }

    const saved = saveContactMessage({ name, email, subject, message });
    const settings = getSettings();

    const targetRecipient = process.env.AUTHOR_EMAIL || settings.authorEmail || 'contact@jwdr.blog';
    let emailSent = false;
    let emailStatus = 'pending';
    let emailError: string | null = null;

    // 1. Try Resend API if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || `${settings.siteTitle} <onboarding@resend.dev>`,
            to: [targetRecipient],
            reply_to: email,
            subject: `[Blog Inquiry] ${subject || 'New Message'} from ${name}`,
            text: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Message on ${settings.siteTitle}</h2>
                <p><strong>From:</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</p>
                <p><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                  <p style="white-space: pre-wrap; margin: 0; color: #1e293b;">${message}</p>
                </div>
                <p style="font-size: 12px; color: #64748b;">Reply directly to this email to reach ${name}.</p>
              </div>
            `,
          }),
        });
        if (res.ok) {
          emailSent = true;
          emailStatus = 'delivered';
        } else {
          const errData = await res.json().catch(() => ({}));
          emailStatus = 'failed';
          emailError = errData.message || 'Resend API error';
        }
      } catch (err: any) {
        emailStatus = 'failed';
        emailError = err.message;
      }
    }

    // 2. Try Standard SMTP if not delivered by Resend and credentials exist
    if (!emailSent) {
      const smtpHost = process.env.SMTP_HOST || settings.smtpHost;
      const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (settings.smtpPort || 587);
      const smtpUser = process.env.SMTP_USER || settings.smtpUser;
      // Strip spaces (e.g. Gmail 16-character app passwords copied with spaces)
      const smtpPass = (process.env.SMTP_PASS || settings.smtpPass || '').replace(/\s+/g, '');
      const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465 || Boolean(settings.smtpSecure);

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
            tls: {
              rejectUnauthorized: false,
            },
          });

          await transporter.sendMail({
            from: `"${name} (via Blog)" <${smtpUser}>`,
            to: targetRecipient,
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
          emailStatus = 'delivered';
        } catch (mailErr: any) {
          console.error('SMTP delivery notice:', mailErr?.message);
          emailStatus = 'failed';
          emailError = mailErr?.message || 'SMTP delivery rejected by host';
        }
      } else {
        emailStatus = 'unconfigured';
      }
    }

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your message has been received.`,
      emailSent,
      emailStatus,
      emailError,
      data: saved
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Combine local/tmp messages with cloud KV if present
  const localMessages = getAllMessages();
  const cloudMessages = await getCloudMessages().catch(() => null);

  if (cloudMessages && Array.isArray(cloudMessages)) {
    const map = new Map();
    for (const m of [...localMessages, ...cloudMessages]) {
      if (m?.id) map.set(m.id, m);
    }
    const combined = Array.from(map.values()).sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ success: true, messages: combined });
  }

  return NextResponse.json({ success: true, messages: localMessages });
}

export async function PATCH(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();
  const success = markMessageRead(id);
  return NextResponse.json({ success });
}
