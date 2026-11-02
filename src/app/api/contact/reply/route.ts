import { NextResponse } from 'next/server';
import { getAllMessages, saveMessageReply, getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import { renderReaderReplyEmail } from '@/lib/emailTemplates';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  try {
    const { id, replySubject, replyContent } = await request.json();

    if (!id || !replyContent) {
      return NextResponse.json(
        { success: false, error: 'Please provide both the message ID and your reply content.' },
        { status: 400 }
      );
    }

    const messages = getAllMessages();
    const targetMsg = messages.find((m) => m.id === id);

    if (!targetMsg) {
      return NextResponse.json({ success: false, error: 'Message not found.' }, { status: 404 });
    }

    const settings = getSettings();
    const subject = replySubject || `Re: ${targetMsg.subject || 'Your message on JWDR Blog'}`;

    // Render the premium branded reader reply email template
    const emailHtml = renderReaderReplyEmail({
      siteTitle: settings.siteTitle,
      authorName: settings.authorName || 'Joseph',
      authorEmail: settings.authorEmail || 'saiofficial2284@gmail.com',
      recipientName: targetMsg.name,
      replySubject: subject,
      replyContent,
      originalSubject: targetMsg.subject,
      originalMessage: targetMsg.message,
      originalDate: targetMsg.createdAt,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://jwdr-blog.vercel.app',
    });

    let emailSent = false;
    let emailError: string | null = null;

    // 1. Try Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || `${settings.authorName} <onboarding@resend.dev>`,
            to: [targetMsg.email],
            reply_to: settings.authorEmail || 'saiofficial2284@gmail.com',
            subject,
            text: replyContent,
            html: emailHtml,
          }),
        });
        if (res.ok) {
          emailSent = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          emailError = errData.message || 'Resend API error';
        }
      } catch (err: any) {
        emailError = err.message;
      }
    }

    // 2. Try SMTP
    if (!emailSent) {
      const smtpHost = process.env.SMTP_HOST || settings.smtpHost || 'smtp.gmail.com';
      const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (settings.smtpPort || 587);
      const smtpUser = process.env.SMTP_USER || settings.smtpUser || 'saiofficial2284@gmail.com';
      const smtpPass = (process.env.SMTP_PASS || settings.smtpPass || 'shbgtiktmfejqmlx').replace(/\s+/g, '');
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
            from: `"${settings.authorName || 'Joseph'}" <${smtpUser}>`,
            to: targetMsg.email,
            replyTo: settings.authorEmail || smtpUser,
            subject,
            text: `${replyContent}\n\n---\nIn response to your inquiry:\n"${targetMsg.message}"`,
            html: emailHtml,
          });
          emailSent = true;
        } catch (mailErr: any) {
          console.error('SMTP reply delivery error:', mailErr);
          emailError = mailErr?.message || 'SMTP delivery rejected';
        }
      } else {
        emailError = 'SMTP credentials not configured';
      }
    }

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: `Failed to deliver email: ${emailError}` },
        { status: 500 }
      );
    }

    // Update message state with reply content and timestamp
    const updated = saveMessageReply(id, {
      replySubject: subject,
      replyContent,
    });

    return NextResponse.json({
      success: true,
      message: `Your reply was sent directly to ${targetMsg.name} (${targetMsg.email})!`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to send reply' }, { status: 500 });
  }
}
