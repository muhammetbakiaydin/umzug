import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileText, Users, Settings, Calendar, TrendingUp, User2, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalOffers: 0,
    thisMonthOffers: 0,
    totalRevenue: 0,
    activeOffers: 0,
    recentOffers: [],
    loading: true
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total offers
      const { count: totalOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })

      // Get this month's offers
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count: thisMonthOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)

      // Get total revenue
      const { data: allOffers } = await supabase
        .from('offers')
        .select('flat_rate_price')
        .eq('status', 'accepted')

      const totalRevenue = allOffers?.reduce((sum, offer) => sum + (offer.flat_rate_price || 0), 0) || 0

      // Get active offers (in processing)
      const { count: activeOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'sent'])

      // Get recent offers
      const { data: recentOffers } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalOffers: totalOffers || 0,
        thisMonthOffers: thisMonthOffers || 0,
        totalRevenue,
        activeOffers: activeOffers || 0,
        recentOffers: recentOffers || [],
        loading: false
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-secondary">Umzug UNIT GmbH</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-secondary mb-2">Willkommen, Administrator!</h2>
          <p className="text-slate-600">Hier ist eine Übersicht über Ihre Umzugs-Offerten</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Offers */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Gesamte Offerten</h3>
              <FileText className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.loading ? '...' : stats.totalOffers}
            </div>
            <p className="text-xs text-slate-500">Alle erstellten Offerten</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Diesen Monat</h3>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.loading ? '...' : stats.thisMonthOffers}
            </div>
            <p className="text-xs text-slate-500">Offerten in diesem Monat</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Gesamtumsatz</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.loading ? '...' : formatCurrency(stats.totalRevenue).replace('CHF', 'CHF')}
            </div>
            <p className="text-xs text-slate-500">Geschätzter Gesamtumsatz</p>
          </div>

          {/* Active Offers */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Aktive Offerten</h3>
              <User2 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats.loading ? '...' : stats.activeOffers}
            </div>
            <p className="text-xs text-slate-500">Offerten in Bearbeitung</p>
          </div>
        </div>

        {/* Recent Offers Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Neueste Offerten</h3>
            <Button
              onClick={() => navigate('/admin/offers')}
              variant="ghost"
              className="text-brand-primary hover:bg-brand-primary/10"
            >
              <FileText className="mr-2 h-4 w-4" />
              Alle anzeigen
            </Button>
          </div>
          
          {stats.loading ? (
            <div className="text-center py-12 text-slate-500">Lädt...</div>
          ) : stats.recentOffers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">Noch keine Offerten erstellt</p>
              <Button
                onClick={() => navigate('/admin/offers/new')}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Erste Offerte erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOffers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => navigate(`/admin/offers/${offer.id}`)}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{offer.offer_number}</div>
                    <div className="text-sm text-slate-600">
                      {offer.from_first_name} {offer.from_last_name}
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(offer.flat_rate_price || 0)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(offer.created_at).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : offer.status === 'sent'
                        ? 'bg-blue-100 text-blue-700'
                        : offer.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {offer.status === 'draft' && 'Entwurf'}
                    {offer.status === 'sent' && 'Gesendet'}
                    {offer.status === 'accepted' && 'Akzeptiert'}
                    {offer.status === 'rejected' && 'Abgelehnt'}
                    {offer.status === 'completed' && 'Abgeschlossen'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Schnellaktionen</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* New Offer Button */}
            <button
              onClick={() => navigate('/admin/offers/new')}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg p-6 flex items-center justify-center gap-3 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Neue Offerte</span>
            </button>

            {/* All Offers Button */}
            <button
              onClick={() => navigate('/admin/offers')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg p-6 flex items-center justify-center gap-3 transition-colors shadow-sm hover:shadow-md"
            >
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Alle Offerten</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => navigate('/admin/settings')}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg p-6 flex items-center justify-center gap-3 transition-colors shadow-sm hover:shadow-md"
            >
              <Settings className="h-5 w-5" />
              <span className="font-semibold">Einstellungen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
