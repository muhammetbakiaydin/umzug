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
    if (!value && value !== 0) return 'CHF 0.–'
    // Swiss format: CHF 890.–
    return `CHF ${parseFloat(value).toFixed(0)}.–`
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
          body { margin: 0; padding: 0; }
          .print-page { margin: 0; padding: 20mm; }
          @page { size: A4; margin: 0; }
        }
        .print-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          font-family: Arial, sans-serif;
          padding: 20mm;
          box-sizing: border-box;
        }
        .header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .company-info {
          font-size: 11px;
          line-height: 1.6;
        }
        .company-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .customer-block {
          text-align: right;
          font-size: 11px;
          line-height: 1.6;
        }
        .customer-label {
          font-weight: normal;
          color: #666;
          margin-bottom: 5px;
        }
        .reference-line {
          font-size: 11px;
          margin-bottom: 5px;
        }
        .date-line {
          font-size: 11px;
          margin-bottom: 30px;
          text-align: right;
        }
        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #e67739;
        }
        .service-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          font-size: 11px;
        }
        .service-table th {
          background-color: #f0f0f0;
          border: 1px solid #333;
          padding: 10px 8px;
          text-align: left;
          font-weight: bold;
        }
        .service-table td {
          border: 1px solid #333;
          padding: 8px;
          vertical-align: top;
        }
        .service-table .col-anzahl { width: 15%; }
        .service-table .col-einheit { width: 40%; }
        .service-table .col-prostd { width: 20%; }
        .service-table .col-total { width: 25%; text-align: right; }
        .service-table .total-row {
          font-weight: bold;
          background-color: #f9f9f9;
        }
        .bemerkung-section {
          margin-bottom: 40px;
        }
        .section-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .bemerkung-text {
          font-size: 11px;
          line-height: 1.6;
          min-height: 60px;
          white-space: pre-wrap;
        }
        .signature-section {
          margin-top: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .signature-block {
          font-size: 11px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 8px;
          font-style: italic;
        }
        .signature-name {
          margin-top: 5px;
        }
        .footer {
          margin-top: 60px;
          font-size: 10px;
          color: #666;
          line-height: 1.6;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          text-align: center;
        }
        .vat-exempt-note {
          font-size: 10px;
          font-style: italic;
          color: #666;
        }
      `}</style>

      {/* Header: Company Info (left) + Customer Block (right) */}
      <div className="header-grid">
        <div className="company-info">
          {company?.logo_url && (
            <img 
              src={company.logo_url} 
              alt={company.company_name} 
              style={{ maxWidth: '180px', marginBottom: '15px' }}
            />
          )}
          <div className="company-name">{company?.company_name || 'Firma'}</div>
          <div>{company?.address_street}</div>
          <div>{company?.address_zip} {company?.address_city}</div>
          <div>Tel: {company?.phone}</div>
          <div>Email: {company?.email}</div>
          {company?.website && <div>Web: {company.website}</div>}
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
            <td></td>
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

      {/* Footer */}
      <div className="footer">
        <div style={{ marginBottom: '10px' }}>
          <strong>{company?.company_name || 'Firma'}</strong>
        </div>
        {company?.bank_name && (
          <div style={{ marginBottom: '5px' }}>
            Bank: {company.bank_name} | IBAN: {company.iban || '—'} | BIC: {company.bic || '—'}
          </div>
        )}
        {company?.uid && (
          <div>
            UID: {company.uid} | Handelsregister: {company.commercial_register || '—'}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceiptPrint
