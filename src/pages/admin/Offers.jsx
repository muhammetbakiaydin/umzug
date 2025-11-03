import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { getOffers } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Plus, Search, FileText } from 'lucide-react'

const OffersPage = () => {
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadOffers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = offers.filter(offer => 
        offer.offer_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.customer_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.customer_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOffers(filtered)
    } else {
      setFilteredOffers(offers)
    }
  }, [searchTerm, offers])

  const loadOffers = async () => {
    const { data, error } = await getOffers()
    if (data) {
      setOffers(data)
      setFilteredOffers(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => signOut()} className="bg-white text-brand-secondary border-slate-300 hover:bg-slate-50">
                Logout
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Angebote</h1>
              <p className="text-slate-600 mt-1">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'Angebot gefunden' : 'Angebote gefunden'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/offers/create')}
              className="bg-brand-primary hover:bg-[#d16635] text-white font-semibold px-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              Neues Angebot
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="bg-white border-slate-200 text-slate-900 pl-12 h-12 text-base"
              placeholder="Suchen nach Angebotsnummer, Kunde..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              <div className="col-span-2">Angebotsnummer</div>
              <div className="col-span-3">Kunde</div>
              <div className="col-span-2">Umzugsdatum</div>
              <div className="col-span-2">Kategorie</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-1">Status</div>
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
                          {offer.offer_number}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-3 flex items-center">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {offer.customer_first_name} {offer.customer_last_name}
                        </div>
                        {offer.customer_email && (
                          <div className="text-xs text-slate-500 truncate">{offer.customer_email}</div>
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
                    
                    <div className="col-span-2 flex items-center">
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OffersPage
