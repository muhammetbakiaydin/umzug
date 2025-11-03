import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer } from '@/lib/supabase'

const OfferPrint = () => {
  const { id } = useParams()
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOffer()
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
      setOffer(data)
    }
    setLoading(false)
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
          margin: 12mm;
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 9pt;
          line-height: 1.35;
          color: #111;
          background: white;
        }
        
        @media print {
          .print-document {
            margin: 0;
            padding: 0;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        /* Top accent bar */
        .accent-bar {
          display: flex;
          height: 4px;
          width: 100%;
          margin-bottom: 20px;
        }
        
        .accent-bar-black {
          width: 75%;
          background: #000;
        }
        
        .accent-bar-yellow {
          width: 25%;
          background: #F7C948;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-box {
          width: 44px;
          height: 44px;
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
          font-size: 16pt;
          font-weight: 700;
          line-height: 1;
        }
        
        .brand-yellow {
          color: #F7C948;
        }
        
        .brand-black {
          color: #000;
        }
        
        .header-right {
          text-align: right;
          font-size: 8pt;
          line-height: 1.25;
        }
        
        .address-title {
          font-weight: 700;
          margin-bottom: 2px;
        }
        
        .address-block {
          margin-bottom: 8px;
        }
        
        /* Offer details area */
        .details-area {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1.2fr;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 8pt;
        }
        
        .details-left {
          line-height: 1.5;
        }
        
        .details-left div {
          margin-bottom: 3px;
        }
        
        .location-block {
          line-height: 1.4;
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
          text-decoration: underline;
        }
        
        /* Main content */
        .offer-title {
          font-size: 22pt;
          font-weight: 700;
          margin-bottom: 12px;
          margin-top: 16px;
        }
        
        .salutation {
          margin-bottom: 8px;
        }
        
        .intro-text {
          margin-bottom: 16px;
          line-height: 1.4;
        }
        
        /* Key-value list */
        .kv-list {
          margin-bottom: 16px;
        }
        
        .kv-row {
          display: flex;
          margin-bottom: 6px;
        }
        
        .kv-label {
          width: 180px;
          flex-shrink: 0;
          color: #444;
        }
        
        .kv-value {
          color: #111;
          font-weight: 500;
        }
        
        /* Umzug table */
        .umzug-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          page-break-inside: avoid;
        }
        
        .umzug-table th,
        .umzug-table td {
          border: 1px solid #E5E7EB;
          padding: 10px 12px;
          text-align: left;
        }
        
        .umzug-table th {
          background: #FAFAFA;
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
          margin-bottom: 20px;
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          width: 14px;
          height: 14px;
          border: 1px solid #666;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        
        .checkbox.checked::after {
          content: '✓';
        }
        
        .cleaning-price {
          font-weight: 600;
          font-size: 10pt;
        }
        
        /* Grand total */
        .grand-total {
          text-align: right;
          margin-top: 24px;
          font-size: 14pt;
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
      `}</style>

      {/* Top accent bar */}
      <div className="accent-bar">
        <div className="accent-bar-black"></div>
        <div className="accent-bar-yellow"></div>
      </div>

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="logo-box">
            <img src="/cropped-umzug-final.png" alt="Umzug UNIT Logo" />
          </div>
          <div className="brand-text">
            <span className="brand-yellow">Umzug UNIT</span>
            <span className="brand-black"> GmbH</span>
          </div>
        </div>
        <div className="header-right">
          <div className="address-block">
            <div className="address-title">Kontakt</div>
            <div>Umzug UNIT GmbH</div>
            <div>Tulpenweg 22</div>
            <div>3250 Lyss</div>
            <div>Tel: 032 310 70 60</div>
            <div>Tel: 078 935 82 82</div>
            <div>info@umzug-unit.ch</div>
          </div>
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
          <div>__ Meter zur Ladekante, Lift: {yesNo(offer.from_elevator)}</div>
          <div>{offer.from_salutation} {offer.from_first_name} {offer.from_last_name}</div>
          <div>{offer.from_street}</div>
          <div>{offer.from_zip} {offer.from_city}</div>
          <div>{offer.from_phone || '—'}</div>
          <div><a href={`mailto:${offer.from_email}`} className="email-link">{offer.from_email || '—'}</a></div>
        </div>
        
        <div className="location-block">
          <div className="location-title">Neuer Standort:</div>
          <div>__ Meter zur Ladekante, Lift: {yesNo(offer.to_elevator)}</div>
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
          Pauschalpreis Reinigung: {formatCurrency(900)}
        </div>
      </div>

      {/* Grand total */}
      <div className="grand-total no-break">
        <span className="total-label">Total:</span>
        <span className="total-amount">{formatCurrency((offer.flat_rate_price || 0) * 1.077)}</span>
      </div>

      {/* Terms & Conditions */}
      <div style={{ marginTop: '40px', fontSize: '8pt', lineHeight: '1.4', pageBreakBefore: 'auto' }}>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Versicherungen:</div>
          <p style={{ marginBottom: '8px' }}>
            Gegen Verlust oder Beschädigung Ihrer Güter haften wir gemäss Schweizerischem Frachtvertragsgesetz (OF). 
            Wir machen Sie darauf aufmerksam, dass die Ware zum Zeitwert und nicht zum Neuwert versichert ist und zwar 
            bis zu einem Warenwert von CHF 1 Mio. Kontaktieren Sie uns bitte falls Sie das Transportgut oder einzelne 
            Gegenstände zu Neuwert speziell versichern möchten, wir informieren Sie gerne über die Ansätze.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Vorbereitung:</div>
          <p style={{ marginBottom: '8px' }}>
            Das Verpacken von kleineren Gegenständen wird durch den Kunden in Kartonschachteln bereitgestellt. 
            Grösseres Umzugsgut wie TV und Sofa wird durch die Firma Umzug UNIT GmbH verpackt.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Verbrauchsmaterial:</div>
          <p style={{ marginBottom: '8px' }}>
            Umzugsdecken werden vor Ort gratis zur Verfügung gestellt, damit das Umzugsgut gut gesichert wird. 
            Verbrauchsmaterial wie Folien oder Bodenfliesen werden verrechnet, sowie das Depot für die Umzugskisten.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Pausen:</div>
          <p style={{ marginBottom: '4px' }}><strong>Vor- und Nachmittag:</strong> 15 Minuten</p>
          <p style={{ marginBottom: '8px' }}><strong>Mittagspause:</strong> 30 Minuten</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Information:</div>
          <p style={{ marginBottom: '8px' }}>
            Die Offerte setzt voraus, dass beide Standorte frei zugänglich und über das schweizer Strassennetz 
            erreichbar sind. Ist der Lieferwert mit normalen Umzugswagen nicht oder nur erschwert zugänglich, 
            so erfolgt die Lieferung bis zur nächsten allgemein zugänglichen Stelle die ohne Zusatzaufwand oder 
            Zusatzkosten erreicht werden kann.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Schäden:</div>
          <p style={{ marginBottom: '8px' }}>
            Schäden müssen gemäss OR Art.452 Absatz 1 sofort nach dem Umzug am Umzugsladearbeiter mitgeteilt und 
            schriftlich auf dem Schadenmeldungsformular mit dem Unterschrift des Kunden und des Umzugschefs festgehalten 
            werden. Schäden die nach dem Umzug können -abgesehen von dem im OR Art. 452 Absätze 2 und 3 erwähnten 
            äusserlich nicht erkennbaren Schäden mit einer Reklamationsfrist von 2 Tagen- nicht mehr berücksichtigt werden.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '6px' }}>Zahlungsbedingungen:</div>
          <p style={{ marginBottom: '8px' }}>
            Barzahlung am Abladeort nach dem Umzug an den Teamleiter. Dies betrifft den Betrag für den gesammten 
            Umzug und Reinigung.
          </p>
        </div>

        <div style={{ marginBottom: '24px', marginTop: '24px', padding: '12px', background: '#f9f9f9', border: '1px solid #ddd' }}>
          <p style={{ marginBottom: '8px' }}>
            Falls Ihnen unser Angebot zusagt, bitten wir Sie uns dieses umgehend unterschrieben zurück zu schicken, 
            damit wir den von Ihnen gewünschten Termin frühzeitig reservieren können.
          </p>
          <p style={{ marginBottom: '0' }}>
            Wir würden uns freuen, diesen Auftrag für Sie auszuführen und sichern Ihnen in jeder Beziehung eine 
            fachmännische und zuverlässigen Umzug zu. Falls Sie Fragen haben, stehen wir Ihnen gerne zur Verfügung.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '2px' }}>Freundliche Grüsse</p>
          <p style={{ marginBottom: '8px' }}>Verkaufsleiter<br />Minerva Marco</p>
        </div>

        <div style={{ background: '#172b4c', color: 'white', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontWeight: '700', fontSize: '10pt', marginBottom: '8px' }}>Kontakt</div>
          <p style={{ marginBottom: '4px' }}><strong>Umzug UNIT GmbH</strong></p>
          <p style={{ marginBottom: '2px' }}>Tulpenweg 22</p>
          <p style={{ marginBottom: '8px' }}>3250 Lyss</p>
          <p style={{ marginBottom: '2px' }}><strong>Tel:</strong> 032 310 70 60</p>
          <p style={{ marginBottom: '2px' }}><strong>Tel:</strong> 078 935 82 82</p>
          <p style={{ marginBottom: '0' }}><strong>E-Mail:</strong> info@umzug-unit.ch</p>
        </div>

        <div style={{ background: '#fff9e6', border: '2px solid #ffd700', padding: '16px', marginBottom: '24px', pageBreakInside: 'avoid' }}>
          <p style={{ marginBottom: '12px', fontWeight: '600' }}>
            Hiermit erteile ich der Firma Umzug UNIT GmbH den obgenannten Auftrag und bestätige, dieses Angebot gelesen 
            zu haben und mit allen Punkten einverstanden zu sein. Mit der Unterschrift bestätigen Sie, dass Sie mit 
            den AGB's und der Offerte einverstanden sind.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '4px' }}>Ort, Datum</div>
              <div style={{ borderBottom: '1px solid #333', height: '30px' }}></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8pt', fontWeight: '600', marginBottom: '4px' }}>Unterschrift</div>
              <div style={{ borderBottom: '1px solid #333', height: '30px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '8pt', color: '#666', borderTop: '1px solid #ddd', paddingTop: '12px' }}>
          <p style={{ fontWeight: '600', marginBottom: '4px', color: '#172b4c' }}>Umzug UNIT GmbH</p>
          <p style={{ marginBottom: '2px' }}>Tel: 032 310 70 60 / 078 935 82 82</p>
          <p style={{ marginBottom: '0' }}>E-Mail: info@umzug-unit.ch</p>
        </div>

      </div>
    </div>
  )
}

export default OfferPrint
