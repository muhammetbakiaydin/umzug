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
import { generateInvoiceNumber, generateCustomerNumber } from '@/lib/utils'
import { ArrowLeft, Save, Search, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const CreateInvoice = () => {
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
  const [invoiceNumber, setInvoiceNumber] = useState('')
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    customerName: '',
    customerAddress: '',
    customerCity: '',
    lineItems: [
      { description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    paymentTerms: '30 Tage netto',
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
    
    // Generate invoice number
    const newInvoiceNumber = await generateInvoiceNumber(supabase)
    setInvoiceNumber(newInvoiceNumber)
    setFormData(prev => ({ ...prev, invoiceNumber: newInvoiceNumber }))
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

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }))
  }

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }))
  }

  const updateLineItem = (index, field, value) => {
    setFormData(prev => {
      const newLineItems = [...prev.lineItems]
      newLineItems[index][field] = value
      
      // Recalculate total for this line item
      if (field === 'quantity' || field === 'unitPrice') {
        newLineItems[index].total = newLineItems[index].quantity * newLineItems[index].unitPrice
      }
      
      return { ...prev, lineItems: newLineItems }
    })
  }

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateVAT = () => {
    if (!vatEnabled) return 0
    return (calculateSubtotal() * vatRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT()
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
      const subtotal = calculateSubtotal()
      const vatAmount = calculateVAT()
      const total = calculateTotal()

      const invoiceData = {
        document_type: 'invoice',
        invoice_number: formData.invoiceNumber,
        offer_date: formData.invoiceDate,
        from_first_name: formData.customerName.split(' ')[0] || '',
        from_last_name: formData.customerName.split(' ').slice(1).join(' ') || '',
        from_street: formData.customerAddress,
        from_city: formData.customerCity,
        notes: formData.notes,
        flat_rate_price: subtotal,
        subtotal: subtotal,
        tax_rate: vatEnabled ? vatRate : 0,
        tax_amount: vatAmount,
        total: total,
        status: 'sent',
        category: 'rechnung',
        created_by_user_id: user?.id,
        created_by_name: user?.email,
        // Store line items as JSON in notes or a custom field
        line_items_json: JSON.stringify(formData.lineItems),
        payment_terms: formData.paymentTerms,
        due_date: formData.dueDate,
      }

      const { data: invoice, error: invoiceError } = await createOffer(invoiceData)
      
      if (invoiceError) {
        toast.error('Fehler beim Erstellen der Rechnung: ' + invoiceError.message)
      } else {
        toast.success('Rechnung erfolgreich erstellt!')
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
          <h1 className="text-2xl font-bold text-brand-secondary">Neue Rechnung erstellen</h1>
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

          {/* Rechnungsdetails */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Rechnungsdetails</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-slate-700">Rechnung Nr. *</Label>
                <Input
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                  value={formData.invoiceNumber}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <Label className="text-slate-700">Rechnungsdatum *</Label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.invoiceDate}
                  onChange={(e) => handleChange('invoiceDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700">Fälligkeitsdatum *</Label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-700">Zahlungsbedingungen</Label>
              <Input
                className="bg-white border-slate-200 text-slate-900"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
                placeholder="z.B. 30 Tage netto"
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

          {/* Positionen */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">Rechnungspositionen</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Position hinzufügen
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4 last:border-b-0">
                  <div className="col-span-5">
                    <Label className="text-slate-700 text-xs">Beschreibung</Label>
                    <Input
                      className="bg-white border-slate-200 text-slate-900"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Leistungsbeschreibung"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Menge</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-white border-slate-200 text-slate-900"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Einzelpreis</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-white border-slate-200 text-slate-900"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Gesamt</Label>
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-500"
                      value={formatCurrency(item.total)}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between text-base">
                <span>Zwischensumme:</span>
                <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {vatEnabled && (
                <div className="flex justify-between text-base">
                  <span>MwSt. ({vatRate}%):</span>
                  <span className="font-mono">{formatCurrency(calculateVAT())}</span>
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
              {loading ? 'Erstelle Rechnung...' : 'Rechnung erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInvoice
