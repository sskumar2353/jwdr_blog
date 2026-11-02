import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const settings = getSettings();
  const smtpHost = process.env.SMTP_HOST || settings.smtpHost;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (settings.smtpPort || 587);
  const smtpUser = process.env.SMTP_USER || settings.smtpUser;
  const smtpPass = (process.env.SMTP_PASS || settings.smtpPass || '').replace(/\s+/g, '');
  const targetEmail = process.env.AUTHOR_EMAIL || settings.authorEmail || smtpUser;
  const hasResend = !!process.env.RESEND_API_KEY;

  const isConfigured = hasResend || (!!smtpHost && !!smtpUser && !!smtpPass);

  return NextResponse.json({
    configured: isConfigured,
    provider: hasResend ? 'Resend API' : (smtpHost ? `SMTP (${smtpHost})` : 'Not Configured'),
    targetEmail,
    details: {
      hasHost: !!smtpHost,
      hasUser: !!smtpUser,
      hasPass: !!smtpPass,
      hasResend,
      port: smtpPort,
    }
  });
}

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
  }

  const settings = getSettings();
  const smtpHost = process.env.SMTP_HOST || settings.smtpHost;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : (settings.smtpPort || 587);
  const smtpUser = process.env.SMTP_USER || settings.smtpUser;
  const smtpPass = (process.env.SMTP_PASS || settings.smtpPass || '').replace(/\s+/g, '');
  const smtpSecure = process.env.SMTP_SECURE === 'true' || Number(smtpPort) === 465 || Boolean(settings.smtpSecure);
  const targetEmail = process.env.AUTHOR_EMAIL || settings.authorEmail || smtpUser;

  // Check if Resend is configured
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
          to: [targetEmail],
          subject: `[Test Email] Verification from ${settings.siteTitle}`,
          html: `<p>Congratulations! Your email system on <strong>${settings.siteTitle}</strong> is working properly via Resend.</p>`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully via Resend to ${targetEmail}!`,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: data.message || 'Resend API returned an error',
        }, { status: 400 });
      }
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  // Check if SMTP is configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    return NextResponse.json({
      success: false,
      error: 'SMTP credentials are not configured yet. Please add SMTP_HOST, SMTP_USER, and SMTP_PASS in your Vercel Environment Variables (or .env.local).',
      configured: {
        smtpHost: !!smtpHost,
        smtpUser: !!smtpUser,
        smtpPass: !!smtpPass,
        targetEmail,
      }
    }, { status: 400 });
  }

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

    // Verify connection first
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${settings.siteTitle}" <${smtpUser}>`,
      to: targetEmail,
      subject: `[Test Email] Connection Confirmed on ${settings.siteTitle}`,
      text: `Hello,\n\nYour blog email system is successfully configured and working!\nWhen readers send a message through your blog contact form, you will receive it here.\n\nTime: ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669; margin-top: 0;">✓ Email Connected Successfully!</h2>
          <p>Your email dispatch system on <strong>${settings.siteTitle}</strong> is fully operational.</p>
          <p style="color: #64748b; font-size: 13px;">When readers send a message through your contact form, you will immediately receive it at <strong>${targetEmail}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">Sent at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}! Check your inbox.`,
    });
  } catch (err: any) {
    let friendlyTip = '';
    if (err.message && err.message.includes('535')) {
      friendlyTip = ' (Authentication failed: For Gmail, please use a 16-character App Password from myaccount.google.com/apppasswords, not your standard account password).';
    }
    return NextResponse.json({
      success: false,
      error: `SMTP Error: ${err.message}${friendlyTip}`,
    }, { status: 500 });
  }
}
