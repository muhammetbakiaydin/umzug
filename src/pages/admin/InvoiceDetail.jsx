import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getOffer, deleteOffer } from '@/lib/supabase'
import { ArrowLeft, FileDown, Trash2, X } from 'lucide-react'

const InvoiceDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    setLoading(true)
    const { data, error } = await getOffer(id)
    
    if (error) {
      toast.error('Fehler beim Laden der Rechnung')
      navigate('/admin/offers')
      return
    }

    setInvoice(data)
    setLoading(false)
  }

  const parseInvoiceNotes = () => {
    if (!invoice?.notes) return null
    try {
      return JSON.parse(invoice.notes)
    } catch (e) {
      return null
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await deleteOffer(invoice.id)
      if (error) {
        toast.error('Fehler beim Löschen: ' + error.message)
      } else {
        toast.success('Rechnung erfolgreich gelöscht!')
        navigate('/admin/offers')
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(value).replace('CHF', 'CHF ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-slate-900">Lädt Rechnung...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Rechnung nicht gefunden</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/offers')}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Rechnung {invoice.invoice_number}
                </h1>
                <p className="text-slate-600 mt-1">Rechnungsdetails</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open(`/admin/invoices/${id}/print`, '_blank')}
                className="bg-brand-primary hover:bg-[#d16635] text-white font-semibold"
              >
                <FileDown className="mr-2 h-5 w-5" />
                PDF öffnen
              </Button>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Invoice Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rechnungsinformationen</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Rechnung Nr.</div>
                <div className="font-mono text-slate-900 font-medium">{invoice.invoice_number}</div>
              </div>
              <div>
                <div className="text-slate-600">Datum</div>
                <div className="text-slate-900">{formatDate(invoice.offer_date)}</div>
              </div>
              <div>
                <div className="text-slate-600">Status</div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Kundeninformationen</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-slate-600">Name</div>
                <div className="text-slate-900 font-medium">
                  {invoice.from_first_name} {invoice.from_last_name}
                </div>
              </div>
              {invoice.from_street && (
                <div>
                  <div className="text-slate-600">Adresse</div>
                  <div className="text-slate-900">{invoice.from_street}</div>
                </div>
              )}
              {invoice.from_city && (
                <div>
                  <div className="text-slate-600">Ort</div>
                  <div className="text-slate-900">
                    {invoice.from_zip && `${invoice.from_zip} `}
                    {invoice.from_city}
                  </div>
                </div>
              )}
              {invoice.from_email && (
                <div>
                  <div className="text-slate-600">E-Mail</div>
                  <div className="text-slate-900">{invoice.from_email}</div>
                </div>
              )}
              {invoice.from_phone && (
                <div>
                  <div className="text-slate-600">Telefon</div>
                  <div className="text-slate-900">{invoice.from_phone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-slate-700">Zwischensumme:</span>
                <span className="font-mono text-slate-900">{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-slate-700">MwSt. ({invoice.tax_rate}%):</span>
                  <span className="font-mono text-slate-900">{formatCurrency(invoice.tax_amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-300 pt-3">
                <span>Total CHF:</span>
                <span className="font-mono text-brand-primary">{formatCurrency(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Rechnungsdetails</h3>
              {(() => {
                const invoiceData = parseInvoiceNotes()
                if (!invoiceData) {
                  return <div className="text-slate-900 whitespace-pre-wrap">{invoice.notes}</div>
                }
                
                return (
                  <div className="space-y-4 text-sm">
                    {invoiceData.serviceDate && (
                      <div>
                        <div className="text-slate-600 font-medium">Für (Datum):</div>
                        <div className="text-slate-900">{invoiceData.serviceDate}</div>
                      </div>
                    )}
                    
                    {invoiceData.invoiceRows && invoiceData.invoiceRows.length > 0 && (
                      <div>
                        <div className="text-slate-600 font-medium mb-2">Leistungen:</div>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-slate-700 font-medium">Beschreibung</th>
                                <th className="px-3 py-2 text-center text-slate-700 font-medium">Stunden</th>
                                <th className="px-3 py-2 text-center text-slate-700 font-medium">Preis</th>
                                <th className="px-3 py-2 text-right text-slate-700 font-medium">Betrag</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoiceData.invoiceRows.map((row, index) => (
                                <tr key={index} className="border-t border-slate-200">
                                  <td className="px-3 py-2 text-slate-900 whitespace-pre-wrap">{row.description}</td>
                                  <td className="px-3 py-2 text-center text-slate-900">{row.hours}</td>
                                  <td className="px-3 py-2 text-center text-slate-900">{row.price}</td>
                                  <td className="px-3 py-2 text-right text-slate-900 font-mono">{formatCurrency(row.amount || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {invoiceData.paymentTerms && (
                      <div>
                        <div className="text-slate-600 font-medium">Zahlungsbedingungen:</div>
                        <div className="text-slate-900">{invoiceData.paymentTerms}</div>
                      </div>
                    )}
                    
                    {invoiceData.bankRecipientText && (
                      <div>
                        <div className="text-slate-600 font-medium">Bankverbindung:</div>
                        <div className="text-slate-900">{invoiceData.bankRecipientText}</div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Rechnung löschen?</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600">Rechnung:</div>
                <div className="font-mono font-medium text-slate-900">
                  {invoice.invoice_number}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={deleting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Abbrechen
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Wird gelöscht...' : 'Löschen'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceDetail
