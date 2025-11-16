import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Home, FileText, TruckIcon, Grid3x3, Users, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const handleNavigate = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Grid3x3 },
    { path: '/admin/offers', label: 'Umzugsleistungen', icon: TruckIcon },
    { path: '/admin/customers', label: 'Kunden', icon: Users },
    { path: '/admin/settings', label: 'Einstellungen', icon: Settings },
  ]

  const createMenuItems = [
    { path: '/admin/offers/create', label: 'Neue Offerte', icon: FileText },
    { path: '/admin/receipts/create', label: 'Neue Quittung', icon: FileText },
    { path: '/admin/invoices/create', label: 'Neue Rechnung', icon: FileText },
  ]

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-black text-white">
        <div className="container mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Navigation Items */}
            <div className="flex items-center">
              {/* Create Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                  onBlur={() => setTimeout(() => setCreateDropdownOpen(false), 200)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 border-transparent text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  <FileText className="h-4 w-4" />
                  <span>Neue Offerte</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${createDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {createDropdownOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-white shadow-lg rounded-b-md border border-slate-200 min-w-[200px] z-50">
                    {createMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path)
                            setCreateDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Regular Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                      active
                        ? 'border-brand-primary text-white bg-slate-900'
                        : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border-b-2 border-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>Abmelden</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 hover:bg-slate-900 rounded-md transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="border-t border-slate-800">
                {/* Create Menu Items */}
                <div className="border-b border-slate-800">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Erstellen</div>
                  {createMenuItems.map((item) => {
                    const Icon = item.icon
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors w-full border-l-4 border-transparent"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Regular Nav Items */}
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors w-full border-l-4 ${
                        active
                          ? 'border-brand-primary text-white bg-slate-900'
                          : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
                
                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors w-full border-l-4 border-transparent"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Abmelden</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  )
}

export default AdminLayout
