import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getOffers, deleteOffer } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Plus, Search, FileText, Trash2, X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const OffersPage = () => {
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('all') // all, offer, receipt, invoice
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadOffers()
  }, [])

  useEffect(() => {
    let filtered = offers
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(offer => 
        offer.offer_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.from_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.from_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.from_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by document type
    if (docTypeFilter !== 'all') {
      filtered = filtered.filter(offer => offer.document_type === docTypeFilter)
    }
    
    setFilteredOffers(filtered)
  }, [searchTerm, docTypeFilter, offers])

  const loadOffers = async () => {
    const { data, error } = await getOffers()
    if (data) {
      setOffers(data)
      setFilteredOffers(data)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!offerToDelete) return
    
    setDeleting(true)
    try {
      const { error } = await deleteOffer(offerToDelete.id)
      if (error) {
        toast.error('Fehler beim Löschen: ' + error.message)
      } else {
        toast.success('Angebot erfolgreich gelöscht!')
        setShowDeleteModal(false)
        setOfferToDelete(null)
        loadOffers()
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Angebote</h1>
              <p className="text-slate-600 mt-1">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'Angebot gefunden' : 'Angebote gefunden'}
              </p>
            </div>
            <div className="relative group">
              <Button
                className="bg-brand-primary hover:bg-[#d16635] text-white font-semibold px-6"
              >
                <Plus className="mr-2 h-5 w-5" />
                Neu erstellen
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => navigate('/admin/offers/create')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-t-lg transition-colors text-slate-900"
                >
                  Offerte
                </button>
                <button
                  onClick={() => navigate('/admin/receipts/create')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-slate-900"
                >
                  Quittung
                </button>
                <button
                  onClick={() => navigate('/admin/invoices/create')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-b-lg transition-colors text-slate-900"
                >
                  Rechnung
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-[1fr,auto] gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                className="bg-white border-slate-200 text-slate-900 pl-12 h-12 text-base"
                placeholder="Suchen nach Nummer, Kunde..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={docTypeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setDocTypeFilter('all')}
                className={docTypeFilter === 'all' ? 'bg-brand-primary hover:bg-[#d16635]' : ''}
              >
                Alle
              </Button>
              <Button
                variant={docTypeFilter === 'offer' ? 'default' : 'outline'}
                onClick={() => setDocTypeFilter('offer')}
                className={docTypeFilter === 'offer' ? 'bg-brand-primary hover:bg-[#d16635]' : ''}
              >
                Offerten
              </Button>
              <Button
                variant={docTypeFilter === 'receipt' ? 'default' : 'outline'}
                onClick={() => setDocTypeFilter('receipt')}
                className={docTypeFilter === 'receipt' ? 'bg-brand-primary hover:bg-[#d16635]' : ''}
              >
                Quittungen
              </Button>
              <Button
                variant={docTypeFilter === 'invoice' ? 'default' : 'outline'}
                onClick={() => setDocTypeFilter('invoice')}
                className={docTypeFilter === 'invoice' ? 'bg-brand-primary hover:bg-[#d16635]' : ''}
              >
                Rechnungen
              </Button>
            </div>
          </div>
        </div>

        {/* Offers List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <div className="text-slate-900 text-xl">Lädt...</div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'Keine Angebote gefunden' : 'Noch keine Angebote vorhanden'}
            </h3>
            {!searchTerm && (
              <Button
                onClick={() => navigate('/admin/offers/create')}
                className="mt-6 bg-brand-primary hover:bg-[#d16635] text-white font-semibold px-6"
              >
                <Plus className="mr-2 h-5 w-5" />
                Erstes Angebot erstellen
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
              <div className="col-span-2">Nummer</div>
              <div className="col-span-1">Typ</div>
              <div className="col-span-2">Kunde</div>
              <div className="col-span-2">Datum</div>
              <div className="col-span-2">Kategorie</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Aktionen</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-slate-200">
              {filteredOffers.map((offer) => (
                <div 
                  key={offer.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/admin/offers/${offer.id}`)}
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-brand-primary" />
                        </div>
                        <span className="text-sm font-medium text-slate-900 font-mono">
                          {offer.document_type === 'receipt' ? offer.receipt_number :
                           offer.document_type === 'invoice' ? offer.invoice_number :
                           offer.offer_number}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        offer.document_type === 'offer' ? 'bg-blue-100 text-blue-800' :
                        offer.document_type === 'receipt' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {offer.document_type === 'offer' ? 'Offerte' :
                         offer.document_type === 'receipt' ? 'Quittung' :
                         'Rechnung'}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {offer.from_first_name} {offer.from_last_name}
                        </div>
                        {offer.from_email && (
                          <div className="text-xs text-slate-500 truncate">{offer.from_email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-slate-600">
                        {offer.moving_date ? new Date(offer.moving_date).toLocaleDateString('de-CH') : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-slate-600">{offer.category || 'N/A'}</span>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-semibold text-slate-900">
                        CHF {offer.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="col-span-1 flex items-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        offer.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        offer.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOfferToDelete(offer)
                          setShowDeleteModal(true)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 font-mono">
                        {offer.offer_number}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {offer.customer_first_name} {offer.customer_last_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-900">
                          CHF {offer.total?.toFixed(2) || '0.00'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          offer.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          offer.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOfferToDelete(offer)
                        setShowDeleteModal(true)
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && offerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Angebot löschen</h2>
                  <p className="text-sm text-slate-600 mt-1">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <p className="text-sm text-slate-700 mb-2">
                  Möchten Sie das folgende Angebot wirklich löschen?
                </p>
                <p className="font-semibold text-slate-900 font-mono mb-1">
                  {offerToDelete.offer_number}
                </p>
                <p className="text-sm text-slate-600">
                  {offerToDelete.customer_first_name} {offerToDelete.customer_last_name}
                </p>
                <p className="text-sm text-slate-600">
                  Total: <span className="font-semibold">CHF {offerToDelete.total?.toFixed(2) || '0.00'}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  {deleting ? 'Löscht...' : 'Ja, löschen'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setOfferToDelete(null)
                  }}
                  variant="outline"
                  disabled={deleting}
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                >
                  <X className="mr-2 h-5 w-5" />
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OffersPage
