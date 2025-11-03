import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Lock, Mail, ArrowRight } from 'lucide-react'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (user) {
    navigate('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Successfully logged in!')
        navigate('/admin/dashboard')
      }
    } catch (error) {
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-secondary via-brand-secondary to-[#0d1a2f] p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary opacity-10 rounded-full translate-y-48 -translate-x-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src="/cropped-umzug-final.png" alt="Umzug UNIT" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-3xl font-bold">Umzug UNIT</h1>
              <p className="text-blue-200 text-sm">GmbH</p>
            </div>
          </div>

          <div className="mt-auto">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-blue-200 text-lg leading-relaxed max-w-md">
              Manage your moving services, customers, and offers all in one place.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8">
          <p className="text-blue-200 text-sm">
            Tulpenweg 22, 3250 Lyss<br />
            Tel: 032 310 70 60 / 078 935 82 82
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/cropped-umzug-final.png" alt="Umzug UNIT" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-brand-secondary">Umzug UNIT</h1>
              <p className="text-slate-600 text-xs">GmbH</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-brand-secondary mb-2">Admin Login</h2>
              <p className="text-slate-600 text-sm">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@umzug-unit.ch"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-slate-300 focus:border-brand-primary focus:ring-brand-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-slate-300 focus:border-brand-primary focus:ring-brand-primary/20"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-brand-primary hover:bg-[#d16635] text-white font-medium text-base shadow-lg shadow-brand-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-brand-primary/30" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-500 font-medium">SECURE LOGIN</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">Protected by industry-standard encryption</p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
