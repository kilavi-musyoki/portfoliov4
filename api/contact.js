// Vercel Serverless Function — Contact Form Email Delivery
// Deploy: this file goes in /api/contact.js at project root
// If using Vercel, this auto-deploys as an API route: POST /api/contact

// To use: npm install nodemailer in root, add env vars to Vercel dashboard

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER, // musyokikilavi870@gmail.com
                pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your main password!)
            },
        });

        await transporter.sendMail({
            from: `"Silicon Soul Portfolio" <${process.env.GMAIL_USER}>`,
            to: 'musyokikilavi870@gmail.com',
            replyTo: email,
            subject: `[Portfolio] ${subject || 'New contact from ' + name}`,
            html: `
        <div style="font-family: monospace; background: #0A0A0F; color: #00FF88; padding: 24px; border-radius: 8px;">
          <h2 style="color: #D4A843; margin-bottom: 16px;">📨 New Signal Received — Silicon Soul</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: rgba(0,255,136,0.5); width: 100px;">FROM:</td><td style="color: #e0ffe8;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(0,255,136,0.5);">EMAIL:</td><td style="color: #e0ffe8;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(0,255,136,0.5);">SUBJECT:</td><td style="color: #e0ffe8;">${subject || '—'}</td></tr>
          </table>
          <hr style="border-color: rgba(0,255,136,0.2); margin: 16px 0;" />
          <div style="color: rgba(0,255,136,0.6); margin-bottom: 8px;">MESSAGE:</div>
          <div style="color: #e0ffe8; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <hr style="border-color: rgba(0,255,136,0.2); margin: 16px 0;" />
          <div style="color: rgba(0,255,136,0.3); font-size: 11px;">SN-2024-KM-PORTFOLIO-REV2 · Silicon Soul</div>
        </div>
      `,
        });

        res.status(200).json({ success: true, message: 'Signal transmitted.' });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ error: 'Transmission failed. Check SMTP configuration.' });
    }
};
