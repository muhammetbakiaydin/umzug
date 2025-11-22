// Email sending utility using SMTP
export async function sendOfferEmail(offerData, recipientEmail, baseUrl) {
  try {
    // Generate public offer link
    const publicOfferUrl = `${baseUrl}/offer/${offerData.id}`
    
    // Create email content
    const emailContent = {
      from: process.env.NEXT_PUBLIC_SMTP_FROM || 'info@umzug-unit.ch',
      to: recipientEmail,
      subject: `Offerte ${offerData.offer_number} - Umzug UNIT GmbH`,
      text: `Sehr geehrte/r ${offerData.from_salutation} ${offerData.from_last_name},\n\nVielen Dank für Ihre Anfrage. Ihre Offerte ${offerData.offer_number} steht bereit.\n\nBitte öffnen Sie den folgenden Link, um Ihre Offerte anzusehen und zu akzeptieren oder abzulehnen:\n${publicOfferUrl}\n\nFreundliche Grüsse\nUmzug UNIT GmbH`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #000; color: #F7C948; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Umzug UNIT <span style="color: #fff;">GmbH</span></h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Sehr geehrte/r ${offerData.from_salutation} ${offerData.from_last_name},</p>
            <p>Vielen Dank für Ihre Anfrage. Ihre Offerte <strong>${offerData.offer_number}</strong> steht bereit.</p>
            <p>Bitte klicken Sie auf den folgenden Button, um Ihre Offerte anzusehen und zu akzeptieren oder abzulehnen:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${publicOfferUrl}" style="display: inline-block; background: #E67635; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Offerte ansehen</a>
            </div>
            <p style="font-size: 14px; color: #666;">Oder kopieren Sie diesen Link in Ihren Browser:<br>
            <a href="${publicOfferUrl}" style="color: #E67635; word-break: break-all;">${publicOfferUrl}</a></p>
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
      offerNumber: offerData.offer_number,
      publicOfferUrl: publicOfferUrl
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
