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
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpMail = process.env.SMTP_MAIL;
  const smtpService = process.env.SMTP_SERVICE;
  const smtpSecure = process.env.SMTP_SECURE;
  const emailDomain = process.env.EMAIL_DOMAIN;

  if (!smtpHost && !smtpService) {
    console.error('Missing SMTP config: both SMTP_HOST and SMTP_SERVICE are empty');
    return res.status(500).json({ error: 'SMTP configuration incomplete' });
  }

  if (!smtpUser || !smtpPass || !smtpMail) {
    console.error('Missing SMTP credentials:', { smtpUser: !!smtpUser, smtpPass: !!smtpPass, smtpMail: !!smtpMail });
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
    const config: any = {
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };

    if (smtpService) {
      config.service = smtpService;
    } else {
      config.host = smtpHost;
      config.port = smtpPort ? Math.trunc(Number(smtpPort)) : 465;
      config.secure = smtpSecure && smtpSecure !== 'false';
    }

    const transporter = nodemailer.createTransport(config);

    const info = await transporter.sendMail({
      from: smtpMail,
      to,
      subject,
      text,
    });

    console.log('Email sent:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
