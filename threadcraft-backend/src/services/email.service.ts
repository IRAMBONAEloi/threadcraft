import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendVerificationEmail(to: string, token: string, firstName: string) {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  await resend.emails.send({
    from: `ThreadCraft <${fromEmail}>`,
    to,
    subject: 'Welcome to ThreadCraft — Verify Your Email',
    html: `
      <div style="font-family: Inter, sans-serif; background: #18181B; color: #F2F2F3; padding: 40px; border-radius: 16px; max-width: 500px; margin: auto;">
        <h1 style="color: #8B6BFF;">Welcome to ThreadCraft</h1>
        <p>Hi ${firstName},</p>
        <p>Thanks for joining ThreadCraft. Please verify your email to activate your account.</p>
        <a href="${verifyLink}" style="display: inline-block; background: #8B6BFF; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #A0A0A6; font-size: 12px;">If the button doesn't work, copy this link: ${verifyLink}</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(to: string, code: string) {
  await resend.emails.send({
    from: `ThreadCraft <${fromEmail}>`,
    to,
    subject: 'Your ThreadCraft Login Code',
    html: `
      <div style="font-family: Inter, sans-serif; background: #18181B; color: #F2F2F3; padding: 40px; border-radius: 16px; max-width: 500px; margin: auto; text-align: center;">
        <h1 style="color: #8B6BFF;">Your Login Code</h1>
        <p>Use this code to log in to ThreadCraft:</p>
        <div style="background: #1F1F22; padding: 20px; border-radius: 12px; margin: 20px 0; font-size: 36px; letter-spacing: 8px; font-family: monospace; color: #3EE3A6;">
          ${code}
        </div>
        <p style="color: #A0A0A6; font-size: 12px;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
}