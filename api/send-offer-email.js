import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { from, to, subject, text, html, offerId, offerNumber } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'hera.miraysoft.ch',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      auth: {
        user: process.env.SMTP_USER || 'info@umzug-unit.ch',
        pass: process.env.SMTP_PASS || 'Nx5X1y0q)+=#f}l3',
      },
    });

    // Generate PDF URL
    const pdfUrl = `${process.env.NEXT_PUBLIC_URL || req.headers.origin}/admin/offers/${offerId}/print`;

    // Send email with PDF link
    const info = await transporter.sendMail({
      from: from || process.env.SMTP_FROM || 'info@umzug-unit.ch',
      to: to,
      subject: subject,
      text: text + `\n\nOfferte ansehen: ${pdfUrl}`,
      html: html + `<p style="margin-top: 20px;"><a href="${pdfUrl}" style="background: #F7C948; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Offerte ansehen</a></p>`,
    });

    console.log('Email sent:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      message: 'Failed to send email',
      error: error.message 
    });
  }
}
