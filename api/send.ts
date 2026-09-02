import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, pass } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
  }

  const emailPass = process.env.EMAIL_PASS;
  if (!emailPass || pass !== emailPass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpMail = process.env.SMTP_MAIL;
  const emailDomain = process.env.EMAIL_DOMAIN;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpMail) {
    return res.status(500).json({ error: 'SMTP configuration incomplete' });
  }

  if (emailDomain) {
    try {
      const domains = JSON.parse(emailDomain) as string[];
      const domain = to.split('@')[1];
      if (!domain || !domains.includes(domain)) {
        return res.status(400).json({ error: `Email domain ${domain || 'invalid'} is not allowed` });
      }
    } catch {
      return res.status(500).json({ error: 'Invalid EMAIL_DOMAIN format' });
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpMail,
      to,
      subject,
      text,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: String(error) });
  }
}
