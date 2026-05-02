import { getEnv } from '../../../config/env.js';

interface VerificationEmailParams {
  verificationCode: string;
  action: string;
  userEmail: string;
  expiresInMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
}

function getActionDescription(action: string): string {
  const normalized = action.trim().toLowerCase();
  if (normalized === 'sign in' || normalized === 'sign_in' || normalized === 'login') {
    return 'sign in to your account';
  }
  if (normalized === 'sign up' || normalized === 'sign_up' || normalized === 'signup') {
    return 'complete account sign up';
  }
  return `complete ${action}`;
}

function getSubtitle(action: string): string {
  const normalized = action.trim().toLowerCase();
  if (normalized === 'sign up' || normalized === 'sign_up' || normalized === 'signup') {
    return 'Confirm Your Email';
  }
  return 'Security Verification';
}

export function buildVerificationEmailHtml(params: VerificationEmailParams): string {
  const {
    verificationCode,
    action,
    userEmail,
    expiresInMinutes = 15,
    ipAddress,
    userAgent,
  } = params;

  const env = getEnv();
  const siteName = env.SITE_NAME;
  const actionDescription = getActionDescription(action);
  const subtitle = getSubtitle(action);

  const ipBlock = ipAddress
    ? `<p style="color:#8b949e;font-size:12px;margin:0 0 4px;">IP Address</p>
       <p style="color:#ffffff;font-size:14px;margin:0 0 12px;word-break:break-word;">${escapeHtml(ipAddress)}</p>`
    : '';

  const uaBlock = userAgent
    ? `<p style="color:#8b949e;font-size:12px;margin:0 0 4px;">Device</p>
       <p style="color:#ffffff;font-size:14px;margin:0 0 12px;word-break:break-word;">${escapeHtml(userAgent)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;">
<tr><td align="center" style="padding:40px 20px;">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
    <tr><td style="padding-bottom:24px;text-align:center;">
      <span style="color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(siteName)}</span>
      <span style="color:#8b949e;font-size:14px;display:block;margin-top:4px;">${escapeHtml(subtitle)}</span>
    </td></tr>
    <tr><td style="background-color:#161b22;border-radius:8px;padding:32px;">
      <h1 style="color:#58a6ff;font-size:20px;font-weight:600;margin:0 0 16px;">Verification Code Required</h1>
      <p style="color:#c9d1d9;font-size:14px;line-height:22px;margin:0 0 24px;">
        We received a request to ${escapeHtml(actionDescription)} for your ${escapeHtml(siteName)} account.
      </p>
      <div style="background-color:#1a2332;border:1px solid #1f6feb;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:#8b949e;font-size:12px;margin:0 0 4px;">Your verification code</p>
        <p style="color:#ffffff;font-size:34px;line-height:40px;font-weight:700;letter-spacing:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;margin:8px 0 4px;">${escapeHtml(verificationCode)}</p>
        <p style="color:#8b949e;font-size:13px;margin:0;">This code expires in ${expiresInMinutes} minutes.</p>
      </div>
      <p style="color:#c9d1d9;font-size:14px;line-height:22px;margin:0 0 24px;">
        Enter this code in the verification prompt to continue. If you didn't request this, you can safely ignore this email.
      </p>
      <div style="background-color:#1a2332;border:1px solid #1f6feb;border-radius:8px;padding:16px;">
        <p style="color:#8b949e;font-size:12px;margin:0 0 4px;">Account</p>
        <p style="color:#ffffff;font-size:14px;margin:0 0 12px;word-break:break-word;">${escapeHtml(userEmail)}</p>
        <p style="color:#8b949e;font-size:12px;margin:0 0 4px;">Action</p>
        <p style="color:#ffffff;font-size:14px;margin:0 0 12px;">${escapeHtml(actionDescription)}</p>
        ${ipBlock}
        ${uaBlock}
      </div>
    </td></tr>
    <tr><td style="padding-top:24px;text-align:center;">
      <p style="color:#484f58;font-size:12px;margin:0;">
        You received this email because a verification code was requested for your ${escapeHtml(siteName)} account.
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
