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
    // Customer Information
    customerName: '',
    customerStreet: '',
    customerZip: '',
    customerCity: '',
    // Document Information
    referenceText: '',
    // Service Details
    flatDescription: '',
    flatSizeM2: '',
    quantity: 1,
    // Pricing
    cleaningFlatPrice: 0,
    isVatExempt: true,
    // Remarks and Signatures
    remark: '',
    cleaningManagerName: '',
    customerSignatureName: '',
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
      customerStreet: customer.address_street || '',
      customerZip: customer.address_zip || '',
      customerCity: customer.address_city || '',
      customerSignatureName: `${customer.first_name} ${customer.last_name}`,
    }))
    setSearchTerm(`${customer.first_name} ${customer.last_name}`)
    setShowCustomerDropdown(false)
  }

  const calculateTotal = () => {
    const amount = formData.cleaningFlatPrice || 0
    // If VAT exempt, total equals the flat price
    if (formData.isVatExempt) {
      return amount
    }
    // Otherwise include VAT
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
    
    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Bitte geben Sie den Kundennamen ein.')
      return
    }
    if (!formData.customerCity.trim()) {
      toast.error('Bitte geben Sie die Stadt ein.')
      return
    }
    if (!formData.receiptDate) {
      toast.error('Bitte wählen Sie ein Datum aus.')
      return
    }
    if (!formData.cleaningFlatPrice || formData.cleaningFlatPrice <= 0) {
      toast.error('Bitte geben Sie einen gültigen Pauschalpreis ein.')
      return
    }
    
    setLoading(true)

    try {
      const receiptData = {
        document_type: 'receipt',
        receipt_number: formData.receiptNumber,
        offer_date: formData.receiptDate,
        // Customer info
        from_first_name: formData.customerName.split(' ')[0] || '',
        from_last_name: formData.customerName.split(' ').slice(1).join(' ') || '',
        from_street: formData.customerStreet,
        from_zip: formData.customerZip,
        from_city: formData.customerCity,
        // Store additional receipt data in notes as JSON
        notes: JSON.stringify({
          referenceText: formData.referenceText,
          customerName: formData.customerName,
          customerStreet: formData.customerStreet,
          customerZip: formData.customerZip,
          customerCity: formData.customerCity,
          flatDescription: formData.flatDescription,
          flatSizeM2: formData.flatSizeM2,
          quantity: formData.quantity,
          cleaningFlatPrice: formData.cleaningFlatPrice,
          isVatExempt: formData.isVatExempt,
          remark: formData.remark,
          cleaningManagerName: formData.cleaningManagerName,
          customerSignatureName: formData.customerSignatureName,
        }),
        flat_rate_price: formData.cleaningFlatPrice,
        subtotal: formData.cleaningFlatPrice,
        tax_rate: formData.isVatExempt ? 0 : (vatEnabled ? vatRate : 0),
        tax_amount: formData.isVatExempt ? 0 : (vatEnabled ? (formData.cleaningFlatPrice * vatRate) / 100 : 0),
        total: calculateTotal(),
        status: 'sent',
        category: 'quittung_reinigung',
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
          <h1 className="text-2xl font-bold text-brand-secondary">Quittung Reinigung erstellen</h1>
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
            <h3 className="text-base font-semibold text-slate-900 mb-4">Dokumentinformationen</h3>
            
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
            
            <div>
              <Label className="text-slate-700">Unsere Referenz (optional)</Label>
              <Input
                className="bg-white border-slate-200 text-slate-900"
                value={formData.referenceText}
                onChange={(e) => handleChange('referenceText', e.target.value)}
                placeholder="z.B. Projekt-Nr. oder Referenz..."
              />
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
                <Label className="text-slate-700">Name / Firma *</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Milena Mechlig oder Firma GmbH"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">Strasse + Nr.</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerStreet}
                  onChange={(e) => handleChange('customerStreet', e.target.value)}
                  placeholder="Musterstrasse 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">PLZ</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.customerZip}
                    onChange={(e) => handleChange('customerZip', e.target.value)}
                    placeholder="8000"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Stadt *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.customerCity}
                    onChange={(e) => handleChange('customerCity', e.target.value)}
                    placeholder="Zürich"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reinigungsdetails */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Reinigungsdetails</h3>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Wohnungsbeschreibung *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.flatDescription}
                    onChange={(e) => handleChange('flatDescription', e.target.value)}
                    placeholder="z.B. 2.5-Zimmer-Wohnung"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Grösse (m²)</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.flatSizeM2}
                    onChange={(e) => handleChange('flatSizeM2', e.target.value)}
                    placeholder="z.B. 123 m²"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Anzahl</Label>
                <Input
                  type="number"
                  min="1"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-slate-600 mt-1">Normalerweise 1 (Standard)</p>
              </div>

              <div>
                <Label className="text-slate-700">Pauschalpreis für Reinigung (CHF) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.cleaningFlatPrice}
                  onChange={(e) => handleChange('cleaningFlatPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  id="isVatExempt"
                  className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                  checked={formData.isVatExempt}
                  onChange={(e) => handleChange('isVatExempt', e.target.checked)}
                />
                <Label htmlFor="isVatExempt" className="text-slate-700 font-medium cursor-pointer">
                  Nicht mehrwertsteuerpflichtig (Art. 10 MWSTG)
                </Label>
              </div>
            </div>
          </div>

          {/* Bemerkung und Unterschriften */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Bemerkung und Unterschriften</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Bemerkung</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2"
                  value={formData.remark}
                  onChange={(e) => handleChange('remark', e.target.value)}
                  placeholder="Zusätzliche Bemerkungen zur Reinigung..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Reinigungschef</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.cleaningManagerName}
                    onChange={(e) => handleChange('cleaningManagerName', e.target.value)}
                    placeholder="Name des Reinigungschefs"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Kunde (Unterschrift)</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.customerSignatureName}
                    onChange={(e) => handleChange('customerSignatureName', e.target.value)}
                    placeholder="Name für Kundenunterschrift"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between text-base">
                <span>Pauschalpreis Reinigung:</span>
                <span className="font-mono">{formatCurrency(formData.cleaningFlatPrice || 0)}</span>
              </div>
              {!formData.isVatExempt && vatEnabled && (
                <div className="flex justify-between text-base">
                  <span>MwSt. ({vatRate}%):</span>
                  <span className="font-mono">{formatCurrency((formData.cleaningFlatPrice * vatRate) / 100)}</span>
                </div>
              )}
              {formData.isVatExempt && (
                <div className="text-sm text-slate-600 italic">
                  * Nicht mehrwertsteuerpflichtig Art. 10 MWSTG
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-300 pt-3">
                <span>Total CHF:</span>
                <span className="font-mono text-brand-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
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
              {loading ? 'Erstelle Quittung...' : 'Quittung Reinigung erstellen (PDF)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReceipt
