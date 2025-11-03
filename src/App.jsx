import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
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
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <OffersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <CreateOffer />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offers/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <OfferDetail />
                  </AdminLayout>
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
                  <AdminLayout>
                    <CustomersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <SettingsPage />
                  </AdminLayout>
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
