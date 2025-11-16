import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getOffer, deleteOffer } from '@/lib/supabase'
import { ArrowLeft, FileDown, Trash2, X } from 'lucide-react'

const ReceiptDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)
  const [receiptData, setReceiptData] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadReceipt()
  }, [id])

  const loadReceipt = async () => {
    setLoading(true)
    const { data, error } = await getOffer(id)
    
    if (error) {
      toast.error('Fehler beim Laden der Quittung')
      navigate('/admin/offers')
      return
    }

    setReceipt(data)
    
    // Parse notes field which contains JSON data for cleaning receipt
    if (data.notes) {
      try {
        const parsedData = JSON.parse(data.notes)
        setReceiptData(parsedData)
      } catch (e) {
        console.error('Failed to parse receipt data:', e)
        setReceiptData({})
      }
    } else {
      setReceiptData({})
    }
    
    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await deleteOffer(receipt.id)
      if (error) {
        toast.error('Fehler beim Löschen: ' + error.message)
      } else {
        toast.success('Quittung erfolgreich gelöscht!')
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
    if (!value && value !== 0) return 'CHF 0.–'
    return `CHF ${parseFloat(value).toFixed(0)}.–`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-slate-900">Lädt Quittung...</div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Quittung nicht gefunden</div>
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
                  Quittung {receipt.receipt_number}
                </h1>
                <p className="text-slate-600 mt-1">
                  {receipt.category === 'quittung_reinigung' ? 'Quittung Reinigung' : 'Quittung'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open(`/admin/receipts/${id}/print`, '_blank')}
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
          {/* Receipt Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quittungsinformationen</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Quittung Nr.</div>
                <div className="font-mono text-slate-900 font-medium">{receipt.receipt_number}</div>
              </div>
              <div>
                <div className="text-slate-600">Datum</div>
                <div className="text-slate-900">{formatDate(receipt.offer_date)}</div>
              </div>
              {receiptData?.referenceText && (
                <div className="md:col-span-2">
                  <div className="text-slate-600">Referenz</div>
                  <div className="text-slate-900">{receiptData.referenceText}</div>
                </div>
              )}
              <div>
                <div className="text-slate-600">Status</div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  receipt.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  receipt.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  receipt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {receipt.status}
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
                <div className="text-slate-900 font-medium">{receiptData?.customerName || `${receipt.from_first_name} ${receipt.from_last_name}`}</div>
              </div>
              {receiptData?.customerStreet && (
                <div>
                  <div className="text-slate-600">Strasse</div>
                  <div className="text-slate-900">{receiptData.customerStreet}</div>
                </div>
              )}
              <div>
                <div className="text-slate-600">Ort</div>
                <div className="text-slate-900">
                  {receiptData?.customerZip && `${receiptData.customerZip} `}
                  {receiptData?.customerCity || receipt.from_city}
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          {receipt.category === 'quittung_reinigung' && receiptData && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reinigungsdetails</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {receiptData.flatDescription && (
                  <div>
                    <div className="text-slate-600">Wohnungsbeschreibung</div>
                    <div className="text-slate-900">{receiptData.flatDescription}</div>
                  </div>
                )}
                {receiptData.flatSizeM2 && (
                  <div>
                    <div className="text-slate-600">Grösse</div>
                    <div className="text-slate-900">{receiptData.flatSizeM2}</div>
                  </div>
                )}
                <div>
                  <div className="text-slate-600">Anzahl</div>
                  <div className="text-slate-900">{receiptData.quantity || 1}</div>
                </div>
                <div>
                  <div className="text-slate-600">Pauschalpreis</div>
                  <div className="text-slate-900 font-semibold">{formatCurrency(receiptData.cleaningFlatPrice || 0)}</div>
                </div>
                {receiptData.isVatExempt && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-slate-600 italic">
                      Nicht mehrwertsteuerpflichtig Art. 10 MWSTG
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-slate-700">Betrag:</span>
                <span className="font-mono text-slate-900">{formatCurrency(receipt.flat_rate_price || 0)}</span>
              </div>
              {receipt.tax_rate > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-slate-700">MwSt. ({receipt.tax_rate}%):</span>
                  <span className="font-mono text-slate-900">{formatCurrency(receipt.tax_amount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-300 pt-3">
                <span>Total CHF:</span>
                <span className="font-mono text-brand-primary">{formatCurrency(receipt.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Remarks and Signatures */}
          {receipt.category === 'quittung_reinigung' && receiptData && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bemerkung und Unterschriften</h3>
              
              {receiptData.remark && (
                <div className="mb-4">
                  <div className="text-slate-600 text-sm mb-2">Bemerkung</div>
                  <div className="text-slate-900 whitespace-pre-wrap">{receiptData.remark}</div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4 text-sm mt-4">
                {receiptData.cleaningManagerName && (
                  <div>
                    <div className="text-slate-600">Reinigungschef</div>
                    <div className="text-slate-900">{receiptData.cleaningManagerName}</div>
                  </div>
                )}
                {receiptData.customerSignatureName && (
                  <div>
                    <div className="text-slate-600">Kunde (Unterschrift)</div>
                    <div className="text-slate-900">{receiptData.customerSignatureName}</div>
                  </div>
                )}
              </div>
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
                  <h3 className="text-xl font-semibold text-slate-900">Quittung löschen?</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600">Quittung:</div>
                <div className="font-mono font-medium text-slate-900">
                  {receipt.receipt_number}
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

export default ReceiptDetail
