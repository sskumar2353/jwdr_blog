import { NextResponse } from 'next/server';
import {
  saveContactMessage,
  getAllMessages,
  markMessageRead,
  markAllMessagesRead,
  deleteMessage,
  clearAllReadMessages,
  getSettings,
  getCloudMessages
} from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import { renderAdminNotificationEmail } from '@/lib/emailTemplates';
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

    const targetRecipient = process.env.AUTHOR_EMAIL || settings.authorEmail || 'saiofficial2284@gmail.com';
    let emailSent = false;
    let emailStatus = 'pending';
    let emailError: string | null = null;

    const emailHtml = renderAdminNotificationEmail({
      siteTitle: settings.siteTitle,
      senderName: name,
      senderEmail: email,
      subject: subject || 'New Contact Inquiry',
      message: message,
      portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jwdr-blog.vercel.app'}/admin/messages`
    });

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
            subject: `[${settings.siteTitle}] New Message from ${name}: ${subject || 'Inquiry'}`,
            text: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: emailHtml,
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
            subject: `[${settings.siteTitle}] Inquiry from ${name}: ${subject || 'New Message'}`,
            text: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}\n\nManage in Author Portal: https://jwdr-blog.vercel.app/admin/messages`,
            html: emailHtml,
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

  try {
    const body = await request.json();
    if (body.all) {
      const success = markAllMessagesRead();
      return NextResponse.json({ success });
    }
    const success = markMessageRead(body.id);
    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.clearRead) {
      const success = clearAllReadMessages();
      return NextResponse.json({ success, message: 'All read notifications cleared.' });
    }
    if (body.id) {
      const success = deleteMessage(body.id);
      return NextResponse.json({ success, message: 'Message deleted successfully.' });
    }
    return NextResponse.json({ success: false, error: 'Missing id or clearRead flag' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
