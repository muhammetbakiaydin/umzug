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
      host: 'hera.miraysoft.ch',
      port: 465,
      secure: true, // SSL/TLS
      auth: {
        user: 'noreply@umzug-unit.ch',
        pass: 'v.;qZEVPB86msBy[',
      },
    });

    // Generate PDF URL
    const pdfUrl = `${process.env.NEXT_PUBLIC_URL || req.headers.origin}/admin/offers/${offerId}/print`;

    // Send email with PDF link
    const info = await transporter.sendMail({
      from: from || 'noreply@umzug-unit.ch',
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
