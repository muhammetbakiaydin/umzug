import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Settings, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [stats, setStats] = useState({
    totalOffers: 0,
    acceptedOffers: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
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

      // Get accepted offers
      const { count: acceptedOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      // Get monthly revenue (current month)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: monthlyOffers } = await supabase
        .from('offers')
        .select('total')
        .eq('status', 'accepted')
        .gte('created_at', startOfMonth)

      const monthlyRevenue = monthlyOffers?.reduce((sum, offer) => sum + (offer.total || 0), 0) || 0

      setStats({
        totalOffers: totalOffers || 0,
        acceptedOffers: acceptedOffers || 0,
        totalCustomers: totalCustomers || 0,
        monthlyRevenue,
        loading: false
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/,/g, "'")
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const menuItems = [
    {
      title: t('nav.offers'),
      icon: FileText,
      path: '/admin/offers',
      description: 'View and manage all offers',
    },
    {
      title: t('nav.customers'),
      icon: Users,
      path: '/admin/customers',
      description: 'Manage customer information',
    },
    {
      title: t('nav.settings'),
      icon: Settings,
      path: '/admin/settings',
      description: 'Configure system settings',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-secondary">Umzug UNIT GmbH </h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button variant="outline" onClick={handleLogout} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card
              key={item.path}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-slate-200"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <item.icon className="w-12 h-12 text-brand-primary mb-4" />
                <CardTitle className="text-brand-secondary">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-brand-secondary">Quick Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-brand-secondary">
                    {stats.loading ? '...' : stats.totalOffers}
                  </div>
                  <div className="text-sm text-slate-600">Total Offers</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-brand-secondary">
                    {stats.loading ? '...' : stats.acceptedOffers}
                  </div>
                  <div className="text-sm text-slate-600">Accepted</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-brand-secondary">
                    {stats.loading ? '...' : stats.totalCustomers}
                  </div>
                  <div className="text-sm text-slate-600">Customers</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-brand-primary">CHF</span>
                  <div className="text-3xl font-bold text-brand-secondary">
                    {stats.loading ? '...' : formatCurrency(stats.monthlyRevenue)}
                  </div>
                  <div className="text-sm text-slate-600">Monthly Revenue</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
