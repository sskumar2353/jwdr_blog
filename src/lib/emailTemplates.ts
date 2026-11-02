/**
 * Premium, responsive HTML email templates for JWDR's Blog
 * Designed for flawless rendering across Gmail, Apple Mail, Outlook, and mobile clients.
 */

interface ReaderReplyOptions {
  siteTitle: string;
  authorName: string;
  authorEmail: string;
  recipientName: string;
  replySubject: string;
  replyContent: string;
  originalSubject?: string;
  originalMessage?: string;
  originalDate?: string;
  siteUrl?: string;
}

interface AdminNotificationOptions {
  siteTitle: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  date?: string;
  portalUrl?: string;
}

export function renderReaderReplyEmail({
  siteTitle = "JWDR's Blog",
  authorName = "Joseph",
  recipientName,
  replySubject,
  replyContent,
  originalSubject,
  originalMessage,
  originalDate,
  siteUrl = "https://jwdr-blog.vercel.app"
}: ReaderReplyOptions): string {
  // Convert newlines to formatted paragraphs
  const formattedReply = replyContent
    .split(/\n\s*\n/)
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #1e293b; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const displayDate = originalDate
    ? new Date(originalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'earlier';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${replySubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Accent Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; border-bottom: 1px solid #334155;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: Georgia, Cambria, 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px;">
                      ${siteTitle}
                    </span>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                      Personal Response &bull; Author Inquiry
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(255, 255, 255, 0.1); border-radius: 9999px; color: #cbd5e1; font-size: 11px; font-weight: 500;">
                      Direct Reply
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <!-- Salutation -->
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #0f172a;">
                Dear ${recipientName},
              </p>

              <!-- Author's Response Content -->
              <div style="margin-bottom: 28px;">
                ${formattedReply}
              </div>

              <!-- Author Signoff Block -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #f1f5f9; width: 100%;">
                <tr>
                  <td style="width: 44px; vertical-align: top;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #0f172a; color: #ffffff; font-family: Georgia, serif; font-size: 18px; font-weight: bold; text-align: center; line-height: 40px;">
                      ${authorName.charAt(0)}
                    </div>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <div style="font-size: 14px; font-weight: bold; color: #0f172a;">
                      ${authorName}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                      Writer & Essayist &bull; ${siteTitle}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Quoted Previous Inquiry Context Box -->
              ${originalMessage ? `
              <div style="margin-top: 32px; padding: 20px; background-color: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 12px 12px 0;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px;">
                  In reference to your message sent on ${displayDate}:
                </div>
                ${originalSubject ? `<div style="font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Subject: ${originalSubject}</div>` : ''}
                <div style="font-size: 13px; color: #475569; line-height: 1.5; font-style: italic; white-space: pre-wrap;">"${originalMessage}"</div>
              </div>
              ` : ''}

              <!-- Visit Blog CTA Button -->
              <div style="margin-top: 32px; text-align: center;">
                <a href="${siteUrl}" style="display: inline-block; padding: 11px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: 0.2px;">
                  Explore More on ${siteTitle} &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Subtle Email Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                You received this personal response because you contacted the author through the contact form at <a href="${siteUrl}" style="color: #64748b; text-decoration: underline;">${siteTitle}</a>.<br/>
                You can reply directly to this email to continue the conversation.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function renderAdminNotificationEmail({
  siteTitle = "JWDR's Blog",
  senderName,
  senderEmail,
  subject,
  message,
  date = new Date().toLocaleString(),
  portalUrl = "https://jwdr-blog.vercel.app/admin/messages"
}: AdminNotificationOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Reader Inquiry from ${senderName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 30px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 3px 10px; background-color: #2563eb; color: #ffffff; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                      New Reader Inquiry
                    </span>
                    <div style="font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #ffffff; margin-top: 8px;">
                      ${siteTitle}
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="color: #94a3b8; font-size: 11px;">
                      ${date}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Details Card -->
          <tr>
            <td style="padding: 28px 30px 20px 30px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                      From
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                      ${senderName}
                    </div>
                    <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                      <a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: none;">${senderEmail}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Inquiry Subject -->
              <div style="margin-top: 20px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">
                  Subject
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 3px;">
                  ${subject || 'No Subject'}
                </div>
              </div>

              <!-- Message Body -->
              <div style="margin-top: 16px; padding: 20px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Message Content
                </div>
                <div style="font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${message}</div>
              </div>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td align="left">
                    <a href="${portalUrl}" style="display: inline-block; padding: 11px 22px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
                      Reply in Author Workspace &rarr;
                    </a>
                  </td>
                  <td align="right">
                    <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject || 'Inquiry')}" style="font-size: 12px; color: #64748b; text-decoration: underline;">
                      Reply via Email Client
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <span style="font-size: 11px; color: #94a3b8;">
                Notification generated by ${siteTitle} &bull; Manage in your Author Portal
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
