import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getOffer } from '@/lib/supabase'

const InvoicePrint = () => {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    
    const { data: invoiceRecord } = await getOffer(id)

    if (invoiceRecord) {
      setInvoice(invoiceRecord)
      // Parse notes field which contains JSON data for invoice
      if (invoiceRecord.notes) {
        try {
          const parsedData = JSON.parse(invoiceRecord.notes)
          setInvoiceData(parsedData)
        } catch (e) {
          console.error('Failed to parse invoice data:', e)
          setInvoiceData({})
        }
      } else {
        setInvoiceData({})
      }
    }
    
    setLoading(false)

    // Auto-print after data loads
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0.00'
    // Format: 230.25
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
        <div className="text-xl">Lädt Rechnung...</div>
      </div>
    )
  }

  if (!invoice || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Rechnung nicht gefunden</div>
      </div>
    )
  }

  const subtotal = invoice.subtotal || 0
  const vatRate = invoiceData.vatRate || 0
  const isVatApplicable = invoiceData.isVatApplicable !== false
  const vatAmount = isVatApplicable ? invoice.tax_amount : 0
  const total = invoice.total || subtotal
  const invoiceRows = invoiceData.invoiceRows || []

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
          padding: 20mm;
          box-sizing: border-box;
          color: #000 !important;
          position: relative;
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
          color: #000;
        }
        .company-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
          color: #000;
        }
        .invoice-info-block {
          text-align: right;
          font-size: 11px;
          line-height: 1.8;
          color: #000;
        }
        .invoice-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #000;
          text-align: left;
        }
        .customer-block {
          font-size: 11px;
          line-height: 1.6;
          margin-bottom: 30px;
          color: #000;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          font-size: 11px;
        }
        .invoice-table th {
          background-color: #fff;
          border: 1px solid #000;
          padding: 10px 8px;
          text-align: left;
          font-weight: bold;
          color: #000;
        }
        .invoice-table td {
          border: 1px solid #000;
          padding: 8px;
          vertical-align: top;
          background-color: #fff;
          color: #000;
        }
        .invoice-table .col-desc { width: 50%; }
        .invoice-table .col-hours { width: 15%; text-align: center; }
        .invoice-table .col-price { width: 20%; text-align: center; }
        .invoice-table .col-amount { width: 15%; text-align: right; }
        .summary-section {
          text-align: right;
          margin-bottom: 40px;
        }
        .summary-line {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        .payment-terms {
          font-size: 11px;
          margin-bottom: 20px;
          color: #000;
        }
        .footer-payment {
          font-size: 10px;
          color: #000;
          border-top: 1px solid #000;
          padding-top: 20px;
          margin-top: 60px;
        }
        .payment-qr-section {
          border-top: 1px solid #000;
          padding-top: 10px;
          margin-top: 20px;
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

      {/* Header: Company Info (left) + Invoice Info (right) */}
      <div className="header-grid">
        <div className="company-info">
          <img 
            src="/cropped-umzug-final.png" 
            alt="Company Logo" 
            style={{ maxWidth: '180px', marginBottom: '15px' }}
          />
          <div className="company-name">Umzug UNIT GmbH</div>
          <div>Tulpenweg 22</div>
          <div>3250 Lyss</div>
          <div>Tel: 032 310 70 60</div>
          <div>Tel: 078 935 82 82</div>
          <div>info@umzug-unit.ch</div>
        </div>
        <div className="invoice-info-block">
          <div><strong>DATUM:</strong> {formatDate(invoice.offer_date)}</div>
          <div><strong>RECHNUNGSNR.:</strong> {invoice.invoice_number}</div>
          {invoiceData.serviceDate && (
            <div><strong>FÜR:</strong> {invoiceData.serviceDate}</div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="invoice-title">RECHNUNG UMZUG</div>

      {/* Customer Block */}
      <div className="customer-block">
        <div><strong>{invoiceData.customerName || '—'}</strong></div>
        {invoiceData.customerStreet && <div>{invoiceData.customerStreet}</div>}
        {(invoiceData.customerZip || invoiceData.customerCity) && (
          <div>{invoiceData.customerZip} {invoiceData.customerCity}</div>
        )}
      </div>

      {/* Invoice Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th className="col-desc">BESCHREIBUNG</th>
            <th className="col-hours">STUNDEN</th>
            <th className="col-price">PREIS</th>
            <th className="col-amount">BETRAG</th>
          </tr>
        </thead>
        <tbody>
          {invoiceRows.map((row, index) => (
            <tr key={index}>
              <td style={{ whiteSpace: 'pre-wrap' }}>{row.description || '—'}</td>
              <td style={{ textAlign: 'center' }}>{row.hours || ''}</td>
              <td style={{ textAlign: 'center' }}>{row.price || ''}</td>
              <td style={{ textAlign: 'right' }}>
                {row.amount ? formatCurrency(row.amount) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="summary-section">
        {isVatApplicable ? (
          <div className="summary-line">
            SUMME inkl. {vatRate}% MwSt. {formatCurrency(total)}
          </div>
        ) : (
          <div className="summary-line">
            TOTAL CHF {formatCurrency(total)}
          </div>
        )}
      </div>

      {/* Payment Terms */}
      {invoiceData.paymentTerms && (
        <div className="payment-terms">
          {invoiceData.paymentTerms}
        </div>
      )}

      {/* Notes Section */}
      {invoiceData.notes && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '11px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Bemerkungen:</div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {invoiceData.notes}
          </div>
        </div>
      )}

      {/* Footer Payment Info */}
      <div className="footer-payment">
        {invoiceData.bankRecipientText || 'Zahlungsempfänger: UBS, Umzug-Unit GmbH, IBAN: CH39 0020 4204 2144 9601 C'}
      </div>

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
            <div style={{ height: '20px' }}></div> <br /> <br /> <br /> <br />
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
                <div style={{ height: '15px' }}></div><br /> <br /><br /> <br />
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

export default InvoicePrint
