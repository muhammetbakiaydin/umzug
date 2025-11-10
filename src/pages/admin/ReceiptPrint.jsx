import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer, getCompanySettings } from '@/lib/supabase'

const ReceiptPrint = () => {
  const { id } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    
    const { data: receiptData } = await getOffer(id)
    const { data: companyData } = await getCompanySettings()

    if (receiptData) setReceipt(receiptData)
    if (companyData) setCompany(companyData)
    
    setLoading(false)

    // Auto-print after data loads
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'CHF 0.00'
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(value).replace('CHF', 'CHF ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lädt Quittung...</div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Quittung nicht gefunden</div>
      </div>
    )
  }

  const amount = receipt.flat_rate_price || 0
  const taxRate = receipt.tax_rate || 0
  const taxAmount = receipt.tax_amount || 0
  const total = receipt.total || amount

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
          margin-bottom: 40px;
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
        .receipt-info {
          text-align: right;
          font-size: 11px;
          line-height: 1.6;
        }
        .receipt-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 40px;
          color: #e67739;
        }
        .customer-box {
          border: 1px solid #333;
          padding: 15px;
          margin-bottom: 40px;
          font-size: 11px;
          line-height: 1.6;
        }
        .customer-label {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content-section {
          margin-bottom: 40px;
        }
        .section-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 10px;
          border-bottom: 2px solid #e67739;
          padding-bottom: 5px;
        }
        .kv-list {
          font-size: 11px;
          line-height: 2;
        }
        .kv-row {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 20px;
          padding: 4px 0;
        }
        .kv-label {
          font-weight: normal;
          color: #666;
        }
        .kv-value {
          font-weight: normal;
          color: #000;
        }
        .price-box {
          background: #f9f9f9;
          border: 2px solid #e67739;
          padding: 20px;
          margin-top: 40px;
          font-size: 12px;
        }
        .price-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          padding: 8px 0;
        }
        .price-total {
          border-top: 2px solid #333;
          padding-top: 12px;
          margin-top: 12px;
          font-size: 16px;
          font-weight: bold;
          color: #e67739;
        }
        .footer {
          margin-top: 60px;
          font-size: 10px;
          color: #666;
          line-height: 1.6;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .payment-method {
          background: #fff3e0;
          border-left: 4px solid #e67739;
          padding: 15px;
          margin: 20px 0;
          font-size: 11px;
        }
        .payment-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
      `}</style>

      {/* Header */}
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
        <div className="receipt-info">
          <div><strong>Quittung Nr.:</strong> {receipt.receipt_number}</div>
          <div><strong>Datum:</strong> {formatDate(receipt.offer_date)}</div>
        </div>
      </div>

      {/* Title */}
      <div className="receipt-title">QUITTUNG</div>

      {/* Customer */}
      <div className="customer-box">
        <div className="customer-label">Empfänger:</div>
        <div>
          <strong>{receipt.from_first_name} {receipt.from_last_name}</strong>
        </div>
        {receipt.from_street && <div>{receipt.from_street}</div>}
        {receipt.from_city && <div>{receipt.from_city}</div>}
      </div>

      {/* Receipt Details */}
      <div className="content-section">
        <div className="section-title">Zahlungsbestätigung</div>
        <div style={{ marginTop: '20px', fontSize: '11px', lineHeight: '1.8' }}>
          <p>
            Hiermit bestätigen wir den Erhalt folgenden Betrages:
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="payment-method">
        <div className="payment-label">Zahlungsmethode</div>
        <div style={{ textTransform: 'capitalize' }}>
          {receipt.category === 'quittung' ? 'Barzahlung' : 'Zahlung erhalten'}
        </div>
      </div>

      {/* Price Calculation */}
      <div className="price-box">
        <div className="price-row">
          <div>Betrag:</div>
          <div style={{ fontFamily: 'monospace' }}>{formatCurrency(amount)}</div>
        </div>
        {taxRate > 0 && (
          <div className="price-row">
            <div>MwSt. ({taxRate}%):</div>
            <div style={{ fontFamily: 'monospace' }}>{formatCurrency(taxAmount)}</div>
          </div>
        )}
        <div className="price-row price-total">
          <div>Total erhalten:</div>
          <div style={{ fontFamily: 'monospace' }}>{formatCurrency(total)}</div>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="content-section" style={{ marginTop: '40px' }}>
          <div className="section-title">Bemerkungen</div>
          <div style={{ fontSize: '11px', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
            {receipt.notes}
          </div>
        </div>
      )}

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
