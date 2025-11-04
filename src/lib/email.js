// Email sending utility using SMTP
export async function sendOfferEmail(offerData, recipientEmail) {
  try {
    // Create email content
    const emailContent = {
      from: 'noreply@umzug-unit.ch',
      to: recipientEmail,
      subject: `Offerte ${offerData.offer_number} - Umzug UNIT GmbH`,
      text: `Sehr geehrte/r ${offerData.from_salutation} ${offerData.from_last_name},\n\nVielen Dank für Ihre Anfrage. Im Anhang finden Sie Ihre Offerte.\n\nFreundliche Grüsse\nUmzug UNIT GmbH`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; color: #F7C948; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Umzug UNIT <span style="color: #fff;">GmbH</span></h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Sehr geehrte/r ${offerData.from_salutation} ${offerData.from_last_name},</p>
            <p>Vielen Dank für Ihre Anfrage. Im Anhang finden Sie Ihre Offerte <strong>${offerData.offer_number}</strong>.</p>
            <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
            <p>Freundliche Grüsse<br><strong>Umzug UNIT GmbH</strong></p>
          </div>
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 5px 0;">Tulpenweg 22, 3250 Lyss</p>
            <p style="margin: 5px 0;">Tel: 032 310 70 60 / 078 935 82 82</p>
            <p style="margin: 5px 0;">E-Mail: info@umzug-unit.ch</p>
          </div>
        </div>
      `,
      offerId: offerData.id,
      offerNumber: offerData.offer_number
    }

    // Send to backend API
    const response = await fetch('/api/send-offer-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}
