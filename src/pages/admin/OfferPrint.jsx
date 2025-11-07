import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer, getCompanySettings, getAllAdditionalServices } from '@/lib/supabase'

const OfferPrint = () => {
  const { id } = useParams()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vatEnabled, setVatEnabled] = useState(true)
  const [cleaningPrice, setCleaningPrice] = useState(900)

  useEffect(() => {
    loadOffer()
    loadSettings()
    loadAdditionalServices()
  }, [id])

  useEffect(() => {
    // Auto-trigger print dialog after content loads
    if (offer && !loading) {
      // Set document title for PDF filename
      document.title = `Offerte_${offer.offer_number}`
      
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [offer, loading])

  const loadOffer = async () => {
    setLoading(true)
    const { data, error } = await getOffer(id)
    
    if (!error && data) {
      console.log('Offer data loaded:', {
        extra_cleaning: data.extra_cleaning,
        extra_disposal: data.extra_disposal,
        extra_packing: data.extra_packing
      })
      setOffer(data)
    }
    setLoading(false)
  }

  const loadSettings = async () => {
    const { data } = await getCompanySettings()
    if (data) {
      setVatEnabled(data.vat_enabled !== false) // Default to true if not set
    }
  }

  const loadAdditionalServices = async () => {
    const { data: services } = await getAllAdditionalServices()
    if (services) {
      // Find the cleaning service price
      const cleaningService = services.find(s => s.name === 'Reinigung' || s.name.toLowerCase().includes('reinigung'))
      if (cleaningService && cleaningService.price) {
        setCleaningPrice(Number(cleaningService.price))
      }
    }
  }

  const formatCurrency = (value) => {
    const formatted = new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0)
    return `CHF ${formatted.replace(/,/g, "'")}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'offen'
    return timeString.replace(':', '.') + ' Uhr'
  }

  const yesNo = (value) => value ? 'Ja' : 'Nein'

  if (loading) {
    return <div className="p-8">Lädt...</div>
  }

  if (!offer) {
    return <div className="p-8">Angebot nicht gefunden</div>
  }

  return (
    <div className="print-document">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: white;
        }
        
        .print-document {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        @media print {
          .print-document {
            margin: 0;
            padding: 0;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        /* Logo and Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-box {
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .brand-text {
          font-size: 18pt;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .brand-yellow {
          color: #F7C948;
        }
        
        .brand-black {
          color: #000;
        }
        
        .header-right {
          text-align: right;
          font-size: 9pt;
          line-height: 1.3;
        }
        
        /* Offer details area */
        .details-area {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1.2fr;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 9pt;
        }
        
        .details-left div {
          margin-bottom: 3px;
        }
        
        .location-block {
          line-height: 1.35;
        }
        
        .location-title {
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .location-block div {
          margin-bottom: 2px;
        }
        
        .email-link {
          color: #0066cc;
          text-decoration: none;
        }
        
        /* Main content */
        .offer-title {
          font-size: 20pt;
          font-weight: 700;
          margin-bottom: 12px;
          margin-top: 12px;
        }
        
        .salutation {
          margin-bottom: 10px;
          font-size: 10pt;
        }
        
        .intro-text {
          margin-bottom: 16px;
          line-height: 1.4;
        }
        
        /* Key-value list */
        .kv-list {
          margin-bottom: 16px;
          font-size: 9.5pt;
        }
        
        .kv-row {
          display: flex;
          margin-bottom: 5px;
        }
        
        .kv-label {
          width: 180px;
          flex-shrink: 0;
        }
        
        .kv-value {
          font-weight: 500;
        }
        
        /* Umzug table */
        .umzug-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
          font-size: 9.5pt;
        }
        
        .umzug-table th,
        .umzug-table td {
          border: 1px solid #ccc;
          padding: 8px 10px;
          text-align: left;
        }
        
        .umzug-table th {
          background: #f5f5f5;
          font-weight: 700;
        }
        
        .umzug-table td.right-cell {
          text-align: right;
          font-weight: 600;
        }
        
        /* Checkbox section */
        .checkbox-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          font-size: 9.5pt;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .checkbox-label {
          min-width: 140px;
        }
        
        .checkbox-options {
          display: flex;
          gap: 16px;
        }
        
        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .checkbox {
          width: 13px;
          height: 13px;
          border: 1px solid #666;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
        }
        
        .checkbox.checked::after {
          content: '✓';
        }
        
        .cleaning-price {
          font-weight: 600;
        }
        
        /* Grand total */
        .grand-total {
          text-align: right;
          margin-top: 20px;
          margin-bottom: 24px;
          font-size: 13pt;
          font-weight: 700;
        }
        
        .total-label {
          display: inline;
          margin-right: 12px;
        }
        
        .total-amount {
          display: inline;
          font-weight: 700;
        }
        
        /* Two-column terms section */
        .terms-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 9pt;
          line-height: 1.35;
        }
        
        .terms-section {
          margin-bottom: 16px;
        }
        
        .terms-heading {
          font-weight: 700;
          margin-bottom: 6px;
        }
        
        .terms-text {
          margin-bottom: 8px;
        }
        
        .terms-text p {
          margin-bottom: 8px;
        }
        
        /* Letter body */
        .letter-body {
          font-size: 9.5pt;
          line-height: 1.4;
          margin-bottom: 20px;
        }
        
        .letter-body p {
          margin-bottom: 10px;
        }
        
        .sender-block {
          margin-top: 20px;
          margin-bottom: 20px;
          font-size: 9.5pt;
        }
        
        .sender-block p {
          margin-bottom: 2px;
        }
        
        /* Confirmation box */
        .confirmation-box {
          margin-top: 24px;
          margin-bottom: 20px;
          font-size: 9pt;
          line-height: 1.4;
        }
        
        .confirmation-text {
          margin-bottom: 16px;
        }
        
        .signature-lines {
          display: flex;
          gap: 40px;
          max-width: 500px;
        }
        
        .signature-field {
          flex: 1;
        }
        
        .signature-label {
          font-size: 8.5pt;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          height: 35px;
        }
        
        /* Footer */
        .page-footer {
          text-align: center;
          font-size: 8.5pt;
          color: #666;
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #ccc;
        }
        
        .page-footer p {
          margin-bottom: 2px;
        }
        
        .footer-company {
          font-weight: 700;
          color: #000;
        }
      `}</style>

      {/* Header with Logo */}
      <div className="header">
        <div className="header-left">
          <div className="logo-box">
            <img src="/cropped-umzug-final.png" alt="Umzug UNIT Logo" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <div className="brand-text">
            <span className="brand-yellow">Umzug UNIT</span>
            <span className="brand-black"> GmbH</span>
          </div>
        </div>
        <div className="header-right">
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>Kontakt</div>
          <div>Umzug UNIT GmbH</div>
          <div>Tulpenweg 22</div>
          <div>3250 Lyss</div>
          <div>Tel: 032 310 70 60</div>
          <div>Tel: 078 935 82 82</div>
          <div>info@umzug-unit.ch</div>
        </div>
      </div>

      {/* Offer details area */}
      <div className="details-area">
        <div className="details-left">
          <div><strong>Offert Nr.:</strong> {offer.offer_number || '—'}</div>
          <div><strong>Offertdatum:</strong> {formatDate(offer.offer_date)}</div>
          <div><strong>Ihre Kundennummer:</strong> {offer.customer_number || '—'}</div>
          <div><strong>Ihr Ansprechpartner:</strong> {offer.contact_person || '—'}</div>
        </div>
        
        <div className="location-block">
          <div className="location-title">Aktueller Standort:</div>
          <div>Meter zur Ladekante, Lift: {yesNo(offer.from_elevator)}</div>
          <div>{offer.from_salutation} {offer.from_first_name} {offer.from_last_name}</div>
          <div>{offer.from_street}</div>
          <div>{offer.from_zip} {offer.from_city}</div>
          <div>{offer.from_phone || '—'}</div>
          <div><a href={`mailto:${offer.from_email}`} className="email-link">{offer.from_email || '—'}</a></div>
        </div>
        
        <div className="location-block">
          <div className="location-title">Neuer Standort:</div>
          <div>Meter zur Ladekante, Lift: {yesNo(offer.to_elevator)}</div>
          <div>{offer.to_street || '—'}</div>
          <div>{offer.to_zip} {offer.to_city}</div>
        </div>
      </div>

      {/* Offer title & intro */}
      <div className="offer-title">Offerte</div>
      <div className="salutation">
        Sehr geehrte/r {offer.from_salutation} {offer.from_last_name},
      </div>
      <div className="intro-text">
        Vielen Dank für Ihre Anfrage. Ich freue mich, Ihnen die folgende Offerte unterbreiten zu können:
      </div>

      {/* Key-value list */}
      <div className="kv-list">
        <div className="kv-row">
          <div className="kv-label">Umzugstermin:</div>
          <div className="kv-value">{formatDate(offer.moving_date)}</div>
        </div>
        <div className="kv-row">
          <div className="kv-label">Arbeitsbeginn:</div>
          <div className="kv-value">{formatTime(offer.start_time)}</div>
        </div>
        <div className="kv-row">
          <div className="kv-label">Reinigungstermin:</div>
          <div className="kv-value">{offer.cleaning_date ? formatDate(offer.cleaning_date) : 'offen'}</div>
        </div>
        <div className="kv-row">
          <div className="kv-label">Reinigung Arbeitsbeginn:</div>
          <div className="kv-value">{offer.cleaning_start_time ? formatTime(offer.cleaning_start_time) : 'offen'}</div>
        </div>
        <div className="kv-row">
          <div className="kv-label">Abgabe:</div>
          <div className="kv-value">—</div>
        </div>
        <div className="kv-row">
          <div className="kv-label">Objekt:</div>
          <div className="kv-value">{offer.object_description || '—'}</div>
        </div>
      </div>

      {/* Umzug table */}
      <table className="umzug-table no-break">
        <thead>
          <tr>
            <th colSpan="2">Umzug:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Umzugswagen: {offer.trucks || 0}</td>
            <td className="right-cell">Pauschalpreis Umzug: {formatCurrency(offer.flat_rate_price)}</td>
          </tr>
          <tr>
            <td>Umzugsmitarbeiter: {offer.workers || 0}</td>
            <td></td>
          </tr>
          <tr>
            <td>{offer.boxes_note || '20 Umzugskisten Kostenlos zur Verfügung'}</td>
            <td>{offer.assembly_note || 'Inkl. De/Montage'}</td>
          </tr>
        </tbody>
      </table>

      {/* Checkbox section */}
      <div className="checkbox-section no-break">
        <div className="checkbox-group">
          <div className="checkbox-row">
            <div className="checkbox-label">Reinigung:</div>
            <div className="checkbox-options">
              <div className="checkbox-option">
                <span className={`checkbox ${offer.extra_cleaning ? 'checked' : ''}`}></span>
                <span>JA</span>
              </div>
              <div className="checkbox-option">
                <span className={`checkbox ${!offer.extra_cleaning ? 'checked' : ''}`}></span>
                <span>NEIN</span>
              </div>
            </div>
          </div>
          <div className="checkbox-row">
            <div className="checkbox-label">Entsorgung:</div>
            <div className="checkbox-options">
              <div className="checkbox-option">
                <span className={`checkbox ${offer.extra_disposal ? 'checked' : ''}`}></span>
                <span>JA</span>
              </div>
              <div className="checkbox-option">
                <span className={`checkbox ${!offer.extra_disposal ? 'checked' : ''}`}></span>
                <span>NEIN</span>
              </div>
            </div>
          </div>
          <div className="checkbox-row">
            <div className="checkbox-label">Verpackungsservice:</div>
            <div className="checkbox-options">
              <div className="checkbox-option">
                <span className={`checkbox ${offer.extra_packing ? 'checked' : ''}`}></span>
                <span>JA</span>
              </div>
              <div className="checkbox-option">
                <span className={`checkbox ${!offer.extra_packing ? 'checked' : ''}`}></span>
                <span>NEIN</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cleaning-price">
          Pauschalpreis Reinigung: {formatCurrency(cleaningPrice)}
        </div>
      </div>

      {/* Grand total */}
      <div className="grand-total no-break">
        <span className="total-label">
          Total {vatEnabled ? '(inkl. 7.7% MwSt.)' : ''}:
        </span>
        <span className="total-amount">
          {formatCurrency(vatEnabled ? (offer.flat_rate_price || 0) * 1.077 : (offer.flat_rate_price || 0))}
        </span>
      </div>

      {/* Page 1 Footer */}
      <div className="page-footer">
        <p className="footer-company">Umzug UNIT GmbH</p>
        <p>Tel: 032 310 70 60 / 078 935 82 82 • E-Mail: info@umzug-unit.ch</p>
      </div>

      {/* Page Break - Start Page 2 */}
      <div className="page-break"></div>

      {/* Two-column Terms Section */}
      <div className="terms-two-column">
        {/* Left Column */}
        <div>
          <div className="terms-section">
            <div className="terms-heading">Versicherungen</div>
            <div className="terms-text">
              <p>Gegen Verlust oder Beschädigung Ihrer Güter haften wir gemäss Schweizerischem Frachtvertragsgesetz (OF). Wir machen Sie darauf aufmerksam, dass die Ware zum Zeitwert und nicht zum Neuwert versichert ist und zwar bis zu einem Warenwert von CHF 1 Mio.</p>
            </div>
          </div>

          <div className="terms-section">
            <div className="terms-heading">Vorbereitung</div>
            <div className="terms-text">
              <p>Das Verpacken von kleineren Gegenständen wird durch den Kunden in Kartonschachteln bereitgestellt. Grösseres Umzugsgut wie TV und Sofa wird durch die Firma Umzug UNIT GmbH verpackt.</p>
            </div>
          </div>

          <div className="terms-section">
            <div className="terms-heading">Verbrauchsmaterial</div>
            <div className="terms-text">
              <p>Umzugsdecken werden vor Ort gratis zur Verfügung gestellt, damit das Umzugsgut gut gesichert wird. Verbrauchsmaterial wie Folien oder Bodenfliesen werden verrechnet, sowie das Depot für die Umzugskisten.</p>
            </div>
          </div>

          <div className="terms-section">
            <div className="terms-heading">Pausen</div>
            <div className="terms-text">
              <p><strong>Vor- und Nachmittag:</strong> 15 Minuten</p>
              <p><strong>Mittagspause:</strong> 30 Minuten</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="terms-section">
            <div className="terms-heading">Information</div>
            <div className="terms-text">
              <p>Die Offerte setzt voraus, dass beide Standorte frei zugänglich und über das schweizer Strassennetz erreichbar sind. Ist der Lieferwert mit normalen Umzugswagen nicht oder nur erschwert zugänglich, so erfolgt die Lieferung bis zur nächsten allgemein zugänglichen Stelle die ohne Zusatzaufwand oder Zusatzkosten erreicht werden kann.</p>
            </div>
          </div>

          <div className="terms-section">
            <div className="terms-heading">Schäden</div>
            <div className="terms-text">
              <p>Schäden müssen gemäss OR Art.452 Absatz 1 sofort nach dem Umzug am Umzugsladearbeiter mitgeteilt und schriftlich auf dem Schadenmeldungsformular mit dem Unterschrift des Kunden und des Umzugschefs festgehalten werden.</p>
            </div>
          </div>

          <div className="terms-section">
            <div className="terms-heading">Zahlungsbedingungen</div>
            <div className="terms-text">
              <p>Barzahlung am Abladeort nach dem Umzug an den Teamleiter. Dies betrifft den Betrag für den gesammten Umzug und Reinigung.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Body */}
      <div className="letter-body">
        <p>Guten Tag {offer.from_salutation} {offer.from_last_name},</p>
        <p>Falls Ihnen unser Angebot zusagt, bitten wir Sie uns dieses umgehend unterschrieben zurück zu schicken, damit wir den von Ihnen gewünschten Termin frühzeitig reservieren können.</p>
        <p>Wir würden uns freuen, diesen Auftrag für Sie auszuführen und sichern Ihnen in jeder Beziehung eine fachmännische und zuverlässige Dienstleistung zu. Falls Sie Fragen haben, stehen wir Ihnen gerne zur Verfügung.</p>
      </div>

      {/* Sender Block */}
      <div className="sender-block">
        <p>Freundliche Grüsse</p>
        <p><strong>Verkaufsleiter</strong></p>
        <p>Minerva Marco</p>
        <p style={{ marginTop: '8px' }}><strong>Umzug UNIT GmbH</strong></p>
        <p>Tulpenweg 22</p>
        <p>3250 Lyss</p>
      </div>

      {/* Confirmation Statement with Signature Lines */}
      <div className="confirmation-box no-break">
        <div className="confirmation-text">
          Hiermit erteile ich der Firma Umzug UNIT GmbH den obgenannten Auftrag und bestätige, dieses Angebot gelesen zu haben und mit allen Punkten einverstanden zu sein. Mit der Unterschrift bestätigen Sie, dass Sie mit den AGB's und der Offerte einverstanden sind.
        </div>
        <div className="signature-lines">
          <div className="signature-field">
            <div className="signature-label">Ort, Datum</div>
            <div className="signature-line"></div>
          </div>
          <div className="signature-field">
            <div className="signature-label">Unterschrift</div>
            <div className="signature-line"></div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default OfferPrint
