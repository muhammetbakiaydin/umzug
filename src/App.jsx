import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import './lib/i18n'
import { Toaster } from 'sonner'

// Admin Pages
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import OffersPage from './pages/admin/Offers'
import OfferDetail from './pages/admin/OfferDetail'
import OfferPrint from './pages/admin/OfferPrint'
import CreateOffer from './pages/admin/CreateOffer'
import CustomersPage from './pages/admin/Customers'
import SettingsPage from './pages/admin/Settings'

// Public Pages
import Terms from './pages/Terms'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/terms" element={<Terms />} />

            {/* Redirect homepage to login */}
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers"
              element={
                <ProtectedRoute>
                  <OffersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers/create"
              element={
                <ProtectedRoute>
                  <CreateOffer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers/:id"
              element={
                <ProtectedRoute>
                  <OfferDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers/:id/print"
              element={
                <ProtectedRoute>
                  <OfferPrint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
