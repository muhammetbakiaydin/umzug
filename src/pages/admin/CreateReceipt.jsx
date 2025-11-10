import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  supabase, 
  getServiceCategories, 
  createOffer, 
  getCustomers, 
  searchCustomers,
  getAllAdditionalServices,
  getCompanySettings
} from '@/lib/supabase'
import { generateReceiptNumber, generateCustomerNumber } from '@/lib/utils'
import { ArrowLeft, Save, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const CreateReceipt = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  const [vatRate, setVatRate] = useState(7.7)
  const [vatEnabled, setVatEnabled] = useState(true)
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [receiptNumber, setReceiptNumber] = useState('')
  
  const [formData, setFormData] = useState({
    receiptNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerCity: '',
    serviceDescription: '',
    amount: 0,
    paymentMethod: 'bar', // bar, karte, überweisung
    notes: '',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    // Load VAT rate from company settings
    const { data: settings } = await getCompanySettings()
    if (settings) {
      if (settings.vat_rate) setVatRate(settings.vat_rate)
      if (settings.vat_enabled !== undefined) setVatEnabled(settings.vat_enabled)
    }
    
    // Load customers
    const { data: custs } = await getCustomers()
    if (custs) setCustomers(custs)
    
    // Generate receipt number
    const newReceiptNumber = await generateReceiptNumber(supabase)
    setReceiptNumber(newReceiptNumber)
    setFormData(prev => ({ ...prev, receiptNumber: newReceiptNumber }))
  }

  const handleCustomerSearch = async (term) => {
    setSearchTerm(term)
    if (term.length > 0) {
      const { data } = await searchCustomers(term)
      if (data) setCustomers(data)
      setShowCustomerDropdown(true)
    } else {
      const { data: custs } = await getCustomers()
      if (custs) setCustomers(custs)
      setShowCustomerDropdown(false)
    }
  }

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerAddress: customer.address_street || '',
      customerCity: `${customer.address_zip || ''} ${customer.address_city || ''}`.trim(),
    }))
    setSearchTerm(`${customer.first_name} ${customer.last_name}`)
    setShowCustomerDropdown(false)
  }

  const calculateTotal = () => {
    const amount = formData.amount || 0
    if (vatEnabled) {
      return amount + (amount * vatRate) / 100
    }
    return amount
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(value).replace('CHF', 'CHF ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const receiptData = {
        document_type: 'receipt',
        receipt_number: formData.receiptNumber,
        offer_date: formData.receiptDate,
        from_first_name: formData.customerName.split(' ')[0] || '',
        from_last_name: formData.customerName.split(' ').slice(1).join(' ') || '',
        from_street: formData.customerAddress,
        from_city: formData.customerCity,
        notes: formData.notes,
        flat_rate_price: formData.amount,
        subtotal: formData.amount,
        tax_rate: vatEnabled ? vatRate : 0,
        tax_amount: vatEnabled ? (formData.amount * vatRate) / 100 : 0,
        total: calculateTotal(),
        status: 'sent',
        category: 'quittung',
        created_by_user_id: user?.id,
        created_by_name: user?.email,
      }

      const { data: receipt, error: receiptError } = await createOffer(receiptData)
      
      if (receiptError) {
        toast.error('Fehler beim Erstellen der Quittung: ' + receiptError.message)
      } else {
        toast.success('Quittung erfolgreich erstellt!')
        navigate('/admin/offers')
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-secondary">Neue Quittung erstellen</h1>
          <div className="text-slate-600 text-sm">
            Erstellt von: <span className="font-semibold text-brand-secondary">{user?.email || 'Admin'}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/offers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
          </div>

          {/* Quittungsdetails */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Quittungsdetails</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-slate-700">Quittung Nr. *</Label>
                <Input
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                  value={formData.receiptNumber}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <Label className="text-slate-700">Datum *</Label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.receiptDate}
                  onChange={(e) => handleChange('receiptDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Kunde */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Kundeninformationen</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-slate-700">Kunde suchen (optional)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-10 bg-white border-slate-200 text-slate-900"
                    placeholder="Name oder E-Mail eingeben..."
                    value={searchTerm}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => searchTerm && setShowCustomerDropdown(true)}
                  />
                </div>
                {showCustomerDropdown && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="font-semibold text-slate-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-slate-600">{customer.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-slate-700">Kundenname *</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Max Mustermann"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">Adresse</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerAddress}
                  onChange={(e) => handleChange('customerAddress', e.target.value)}
                  placeholder="Musterstrasse 123"
                />
              </div>

              <div>
                <Label className="text-slate-700">PLZ / Stadt</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerCity}
                  onChange={(e) => handleChange('customerCity', e.target.value)}
                  placeholder="8000 Zürich"
                />
              </div>
            </div>
          </div>

          {/* Leistung */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Leistungsbeschreibung</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Beschreibung der Leistung *</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2"
                  value={formData.serviceDescription}
                  onChange={(e) => handleChange('serviceDescription', e.target.value)}
                  placeholder="z.B. Umzugsdienstleistung von Zürich nach Bern"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">Betrag (CHF) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">Zahlungsmethode *</Label>
                <select
                  className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2"
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  required
                >
                  <option value="bar">Bar</option>
                  <option value="karte">Karte</option>
                  <option value="überweisung">Überweisung</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between text-base">
                <span>Betrag:</span>
                <span className="font-mono">{formatCurrency(formData.amount || 0)}</span>
              </div>
              {vatEnabled && (
                <div className="flex justify-between text-base">
                  <span>MwSt. ({vatRate}%):</span>
                  <span className="font-mono">{formatCurrency((formData.amount * vatRate) / 100)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-300 pt-3">
                <span>Total:</span>
                <span className="font-mono text-brand-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Notizen (optional)</h3>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Zusätzliche Bemerkungen..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              size="lg" 
              className="flex-1 bg-brand-primary hover:bg-[#d16635] text-slate-900 font-bold"
              disabled={loading}
            >
              <Save className="mr-2 h-5 w-5" />
              {loading ? 'Erstelle Quittung...' : 'Quittung erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReceipt
