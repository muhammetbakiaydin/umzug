import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer, getCompanySettings } from '@/lib/supabase'

const InvoicePrint = () => {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [company, setCompany] = useState(null)
  const [lineItems, setLineItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    
    const { data: invoiceData } = await getOffer(id)
    const { data: companyData } = await getCompanySettings()

    if (invoiceData) {
      setInvoice(invoiceData)
      // Parse line items from JSON
      if (invoiceData.line_items_json) {
        try {
          const items = JSON.parse(invoiceData.line_items_json)
          setLineItems(items)
        } catch (e) {
          console.error('Error parsing line items:', e)
        }
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
        <div className="text-xl">Lädt Rechnung...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Rechnung nicht gefunden</div>
      </div>
    )
  }

  const subtotal = invoice.subtotal || 0
  const taxRate = invoice.tax_rate || 0
  const taxAmount = invoice.tax_amount || 0
  const total = invoice.total || subtotal

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
        .invoice-info {
          text-align: right;
          font-size: 11px;
          line-height: 1.6;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 40px;
          color: #9333ea;
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
        .line-items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          font-size: 11px;
        }
        .line-items-table th {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        .line-items-table td {
          border: 1px solid #d1d5db;
          padding: 10px;
        }
        .line-items-table .text-right {
          text-align: right;
        }
        .price-box {
          background: #f9f9f9;
          border: 2px solid #9333ea;
          padding: 20px;
          margin-top: 40px;
          font-size: 12px;
          max-width: 400px;
          margin-left: auto;
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
          color: #9333ea;
        }
        .payment-info {
          background: #f0e7ff;
          border-left: 4px solid #9333ea;
          padding: 15px;
          margin: 30px 0;
          font-size: 11px;
        }
        .payment-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .footer {
          margin-top: 60px;
          font-size: 10px;
          color: #666;
          line-height: 1.6;
          border-top: 1px solid #ddd;
          padding-top: 20px;
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
        <div className="invoice-info">
          <div><strong>Rechnung Nr.:</strong> {invoice.invoice_number}</div>
          <div><strong>Rechnungsdatum:</strong> {formatDate(invoice.offer_date)}</div>
          {invoice.due_date && (
            <div><strong>Fälligkeitsdatum:</strong> {formatDate(invoice.due_date)}</div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="invoice-title">RECHNUNG</div>

      {/* Customer */}
      <div className="customer-box">
        <div className="customer-label">Rechnungsadresse:</div>
        <div>
          <strong>{invoice.from_first_name} {invoice.from_last_name}</strong>
        </div>
        {invoice.from_street && <div>{invoice.from_street}</div>}
        {invoice.from_city && <div>{invoice.from_city}</div>}
      </div>

      {/* Payment Terms */}
      {invoice.payment_terms && (
        <div className="payment-info">
          <div className="payment-label">Zahlungsbedingungen</div>
          <div>{invoice.payment_terms}</div>
        </div>
      )}

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <table className="line-items-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Beschreibung</th>
              <th className="text-right" style={{ width: '15%' }}>Menge</th>
              <th className="text-right" style={{ width: '18%' }}>Einzelpreis</th>
              <th className="text-right" style={{ width: '17%' }}>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Price Calculation */}
      <div className="price-box">
        <div className="price-row">
          <div>Zwischensumme:</div>
          <div style={{ fontFamily: 'monospace' }}>{formatCurrency(subtotal)}</div>
        </div>
        {taxRate > 0 && (
          <div className="price-row">
            <div>MwSt. ({taxRate}%):</div>
            <div style={{ fontFamily: 'monospace' }}>{formatCurrency(taxAmount)}</div>
          </div>
        )}
        <div className="price-row price-total">
          <div>Rechnungsbetrag:</div>
          <div style={{ fontFamily: 'monospace' }}>{formatCurrency(total)}</div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div style={{ marginTop: '40px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '10px', borderBottom: '2px solid #9333ea', paddingBottom: '5px' }}>
            Bemerkungen
          </div>
          <div style={{ fontSize: '11px', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </div>
        </div>
      )}

      {/* Footer with Bank Details */}
      <div className="footer">
        <div style={{ marginBottom: '15px' }}>
          <strong>Zahlungsinformationen</strong>
        </div>
        {company?.bank_name && (
          <div>
            <div>Bank: {company.bank_name}</div>
            {company.iban && <div>IBAN: {company.iban}</div>}
            {company.bic && <div>BIC: {company.bic}</div>}
          </div>
        )}
        {company?.uid && (
          <div style={{ marginTop: '15px' }}>
            UID: {company.uid} | Handelsregister: {company.commercial_register || '—'}
          </div>
        )}
        <div style={{ marginTop: '15px' }}>
          <strong>{company?.company_name || 'Firma'}</strong> | 
          {company?.address_street} | 
          {company?.address_zip} {company?.address_city}
        </div>
      </div>
    </div>
  )
}

export default InvoicePrint
