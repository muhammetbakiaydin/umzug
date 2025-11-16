import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer, getCompanySettings } from '@/lib/supabase'

const ReceiptPrint = () => {
  const { id } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [receiptData, setReceiptData] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    
    const { data: receiptRecord } = await getOffer(id)
    const { data: companyData } = await getCompanySettings()

    if (receiptRecord) {
      setReceipt(receiptRecord)
      // Parse notes field which contains JSON data for cleaning receipt
      if (receiptRecord.notes) {
        try {
          const parsedData = JSON.parse(receiptRecord.notes)
          setReceiptData(parsedData)
        } catch (e) {
          console.error('Failed to parse receipt data:', e)
          setReceiptData({})
        }
      } else {
        setReceiptData({})
      }
    }
    if (companyData) setCompany(companyData)
    
    setLoading(false)

    // Auto-print after data loads
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0.00'
    // Format: 123.45 or 123.00
    return parseFloat(value).toFixed(2)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lädt Quittung Reinigung...</div>
      </div>
    )
  }

  if (!receipt || !receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Quittung nicht gefunden</div>
      </div>
    )
  }

  const cleaningPrice = receiptData.cleaningFlatPrice || 0
  const quantity = receiptData.quantity || 1
  const isVatExempt = receiptData.isVatExempt || false
  const totalAmount = receipt.total || cleaningPrice

  return (
    <div className="print-page">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .print-page { margin: 0; padding: 20mm; background: white; }
          @page { size: A4; margin: 0; }
        }
        * {
          color: #000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body, html {
          background: white !important;
        }
        .print-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white !important;
          font-family: Arial, sans-serif;
          padding: 15mm 20mm;
          box-sizing: border-box;
          color: #000 !important;
          position: relative;
        }
        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 15px;
        }
        .company-info {
          font-size: 10px;
          line-height: 1.5;
          color: #000;
        }
        .company-name {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 6px;
          color: #000;
        }
        .customer-block {
          text-align: right;
          font-size: 10px;
          line-height: 1.5;
          color: #000;
        }
        .customer-label {
          font-weight: normal;
          color: #000;
          margin-bottom: 4px;
        }
        .reference-line {
          font-size: 10px;
          margin-bottom: 4px;
          color: #000;
        }
        .date-line {
          font-size: 10px;
          margin-bottom: 15px;
          text-align: right;
          color: #000;
        }
        .receipt-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #000;
        }
        .service-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 10px;
          color: #000;
        }
        .service-table th {
          background-color: #fff;
          border: 1px solid #000;
          padding: 8px 6px;
          text-align: left;
          font-weight: bold;
          color: #000;
        }
        .service-table td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: top;
          background-color: #fff;
          color: #000;
        }
        .service-table .col-anzahl { width: 15%; }
        .service-table .col-einheit { width: 40%; }
        .service-table .col-prostd { width: 20%; }
        .service-table .col-total { width: 25%; text-align: right; }
        .service-table .total-row {
          font-weight: bold;
          background-color: #fff;
        }
        .bemerkung-section {
          margin-bottom: 10px;
        }
        .section-title {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 6px;
          color: #000;
        }
        .bemerkung-text {
          font-size: 10px;
          line-height: 1.4;
          min-height: 25px;
          white-space: pre-wrap;
          color: #000;
        }
        .signature-section {
          margin-top: 15px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 15px;
        }
        .signature-block {
          font-size: 10px;
          color: #000;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 15px;
          padding-top: 6px;
          font-style: italic;
          color: #000;
        }
        .signature-name {
          margin-top: 4px;
          color: #000;
        }
        .vat-exempt-note {
          font-size: 10px;
          font-style: italic;
          color: #000 !important;
        }
        .payment-qr-section {
          border-top: 1px solid #000;
          padding-top: 10px;
          margin-top: 10px;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .payment-info {
          font-size: 8px;
          line-height: 1.3;
          color: #000;
        }
        .payment-title {
          font-weight: bold;
          font-size: 9px;
          margin-bottom: 5px;
          color: #000;
        }
        .qr-code-container {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          margin: 5px 0;
        }
      `}</style>

      {/* Header: Company Info (left) + Customer Block (right) */}
      <div className="header-grid">
        <div className="company-info">
          <img 
            src="/cropped-umzug-final.png" 
            alt="Company Logo" 
            style={{ maxWidth: '140px', marginBottom: '10px' }}
          />
          <div className="company-name">Umzug UNIT GmbH</div>
          <div>Tulpenweg 22</div>
          <div>3250 Lyss</div>
          <div>Tel: 032 310 70 60</div>
          <div>Tel: 078 935 82 82</div>
          <div>info@umzug-unit.ch</div>
        </div>
        <div className="customer-block">
          <div className="customer-label">An:</div>
          <div><strong>{receiptData.customerName || '—'}</strong></div>
          {receiptData.customerStreet && <div>{receiptData.customerStreet}</div>}
          {(receiptData.customerZip || receiptData.customerCity) && (
            <div>{receiptData.customerZip} {receiptData.customerCity}</div>
          )}
        </div>
      </div>

      {/* Reference and Date */}
      {receiptData.referenceText && (
        <div className="reference-line">
          <strong>Unsere Referenz:</strong> {receiptData.referenceText}
        </div>
      )}
      <div className="date-line">
        <strong>Datum:</strong> {formatDate(receipt.offer_date)}
      </div>

      {/* Title */}
      <div className="receipt-title">Quittung Reinigung</div>

      {/* Service Table */}
      <table className="service-table">
        <thead>
          <tr>
            <th className="col-anzahl">Anzahl</th>
            <th className="col-einheit">Einheit</th>
            <th className="col-prostd">Pro Std.</th>
            <th className="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1: Flat description with size and quantity */}
          <tr>
            <td>{quantity}</td>
            <td>
              {receiptData.flatDescription || '—'}
              {receiptData.flatSizeM2 && ` (${receiptData.flatSizeM2})`}
            </td>
            <td>{receiptData.hourlyRate ? formatCurrency(receiptData.hourlyRate) : ''}</td>
            <td></td>
          </tr>

          {/* Row 2: Flat price label */}
          <tr>
            <td></td>
            <td>Pauschalpreis für Ihre Reinigung beträgt</td>
            <td></td>
            <td style={{ textAlign: 'right' }}>{formatCurrency(cleaningPrice)}</td>
          </tr>

          {/* Row 3 (conditional): VAT exemption notice */}
          {isVatExempt && (
            <tr>
              <td></td>
              <td colSpan="3" className="vat-exempt-note">
                Nicht mehrwertsteuerpflichtig Art. 10 MWSTG
              </td>
            </tr>
          )}

          {/* Row 4: Total */}
          <tr className="total-row">
            <td></td>
            <td><strong>Total CHF</strong></td>
            <td></td>
            <td style={{ textAlign: 'right' }}><strong>{formatCurrency(totalAmount)}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* Bemerkung Section */}
      <div className="bemerkung-section">
        <div className="section-title">Bemerkung:</div>
        <div className="bemerkung-text">
          {receiptData.remark || '—'}
        </div>
      </div>

      {/* Signature Section */}
      <div className="signature-section">
        <div className="signature-block">
          <div className="signature-line">
            Reinigungschef
          </div>
          <div className="signature-name">
            {receiptData.cleaningManagerName || '—'}
          </div>
        </div>
        <div className="signature-block">
          <div className="signature-line">
            Kunde
          </div>
          <div className="signature-name">
            {receiptData.customerSignatureName || '—'}
          </div>
        </div>
      </div>
      <br /> <br /> <br /> <br />
      {/* Payment QR Code Section */}
      <div className="payment-qr-section">
        <div className="payment-grid">
          <div className="payment-info">
            <div className="payment-title">Empfangsschein</div>
            <div><strong>Konto / Zahlbar an</strong></div>
            <div>CH39 0020 4204 2144 9601 C</div>
            <div>Umzug Unit GmbH</div>
            <div>Tulpenweg 22</div>
            <div>3250 Lyss</div>
            <div style={{ marginTop: '6px' }}><strong>Zahlbar durch (Name/Adresse)</strong></div>
            <div style={{ height: '20px' }}></div>
            <div><strong>Währung Betrag</strong></div>
            <div>CHF</div>
          </div>
          <div className="payment-info">
            <div className="payment-title">Zahlteil</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div className="qr-code-container">
                <img 
                  src="/QR.png" 
                  alt="QR Code Payment" 
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
              <div>
                <div><strong>Konto / Zahlbar an</strong></div>
                <div>CH39 0020 4204 2144 9601 C</div>
                <div>Umzug Unit GmbH</div>
                <div>Tulpenweg 22</div>
                <div>3250 Lyss</div>
                <div style={{ marginTop: '5px' }}><strong>Zahlbar durch (Name/Adresse)</strong></div>
                <div style={{ height: '15px' }}></div>
                <div><strong>Währung Betrag</strong></div>
                <div>CHF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptPrint
