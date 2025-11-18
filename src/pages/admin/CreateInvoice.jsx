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
import { generateInvoiceNumber, generateOfferNumber, generateCustomerNumber } from '@/lib/utils'
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
    serviceDate: '', // "Für:" field (e.g., "Umzug 23.07.2025")
    customerName: '',
    customerStreet: '',
    customerZip: '',
    customerCity: '',
    invoiceRows: [
      { description: '', hours: '', price: '', amount: '' }
    ],
    isVatApplicable: true,
    vatRate: 8.1,
    paymentTerms: 'Zahlbar innert 5 Tagen',
    bankRecipientText: 'Zahlungsempfänger: UBS, Umzug-Unit GmbH, IBAN: CH39 0020 4204 2144 9601 C',
    notes: '',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    // Load VAT rate from company settings
    const { data: settings } = await getCompanySettings()
    if (settings) {
      if (settings.vat_rate) {
        setVatRate(settings.vat_rate)
        setFormData(prev => ({ ...prev, vatRate: settings.vat_rate }))
      }
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
      customerStreet: customer.address_street || '',
      customerZip: customer.address_zip || '',
      customerCity: customer.address_city || '',
    }))
    setSearchTerm(`${customer.first_name} ${customer.last_name}`)
    setShowCustomerDropdown(false)
  }

  const addInvoiceRow = () => {
    setFormData(prev => ({
      ...prev,
      invoiceRows: [...prev.invoiceRows, { description: '', hours: '', price: '', amount: '' }]
    }))
  }

  const removeInvoiceRow = (index) => {
    setFormData(prev => ({
      ...prev,
      invoiceRows: prev.invoiceRows.filter((_, i) => i !== index)
    }))
  }

  const updateInvoiceRow = (index, field, value) => {
    setFormData(prev => {
      const newRows = [...prev.invoiceRows]
      newRows[index][field] = value
      return { ...prev, invoiceRows: newRows }
    })
  }

  const calculateSubtotal = () => {
    return formData.invoiceRows.reduce((sum, row) => {
      const amount = parseFloat(row.amount) || 0
      return sum + amount
    }, 0)
  }

  const calculateVAT = () => {
    if (!formData.isVatApplicable) return 0
    return (calculateSubtotal() * formData.vatRate) / 100
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

      // Generate offer_number (required field in database)
      const offerNumber = await generateOfferNumber(supabase)

      const invoiceData = {
        document_type: 'invoice',
        offer_number: offerNumber,
        invoice_number: formData.invoiceNumber,
        offer_date: formData.invoiceDate,
        from_first_name: formData.customerName.split(' ')[0] || '',
        from_last_name: formData.customerName.split(' ').slice(1).join(' ') || '',
        from_street: formData.customerStreet,
        from_zip: formData.customerZip,
        from_city: formData.customerCity,
        // Store all invoice-specific data in notes as JSON
        notes: JSON.stringify({
          serviceDate: formData.serviceDate,
          customerName: formData.customerName,
          customerStreet: formData.customerStreet,
          customerZip: formData.customerZip,
          customerCity: formData.customerCity,
          invoiceRows: formData.invoiceRows,
          isVatApplicable: formData.isVatApplicable,
          vatRate: formData.vatRate,
          paymentTerms: formData.paymentTerms,
          bankRecipientText: formData.bankRecipientText,
          notes: formData.notes,
        }),
        flat_rate_price: subtotal,
        subtotal: subtotal,
        tax_rate: formData.isVatApplicable ? formData.vatRate : 0,
        tax_amount: vatAmount,
        total: total,
        status: 'sent',
        category: 'rechnung',
        created_by_user_id: user?.id,
        created_by_name: user?.email,
      }

      const { data: invoice, error: invoiceError } = await createOffer(invoiceData)
      
      if (invoiceError) {
        toast.error('Fehler beim Erstellen der Rechnung: ' + invoiceError.message)
      } else {
        toast.success('Rechnung erfolgreich erstellt!')
        // Open PDF in new window
        window.open(`/admin/invoices/${invoice.id}/print`, '_blank')
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
            <h3 className="text-base font-semibold text-slate-900 mb-4">Dokumentinformationen</h3>
            
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
                <Label className="text-slate-700">Für (Service-Datum)</Label>
                <Input
                  type="date"
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.serviceDate}
                  onChange={(e) => handleChange('serviceDate', e.target.value)}
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
                  placeholder="ESPRIT Network AG oder Herr Tim Känzig"
                  required
                />
              </div>

              <div>
                <Label className="text-slate-700">Strasse + Nr.</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.customerStreet}
                  onChange={(e) => handleChange('customerStreet', e.target.value)}
                  placeholder="Poststrasse 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">PLZ</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.customerZip}
                    onChange={(e) => handleChange('customerZip', e.target.value)}
                    placeholder="4500"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Stadt</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.customerCity}
                    onChange={(e) => handleChange('customerCity', e.target.value)}
                    placeholder="Solothurn"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rechnungspositionen */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">Rechnungspositionen</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInvoiceRow}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Position hinzufügen
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.invoiceRows.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4 last:border-b-0">
                  <div className="col-span-5">
                    <Label className="text-slate-700 text-xs">Beschreibung</Label>
                    <textarea
                      className="w-full min-h-[60px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm"
                      value={row.description}
                      onChange={(e) => updateInvoiceRow(index, 'description', e.target.value)}
                      placeholder="z.B. 1-LW 25m², 3-Mitarbeiter, 8.1% MwSt"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Stunden</Label>
                    <Input
                      className="bg-white border-slate-200 text-slate-900"
                      value={row.hours}
                      onChange={(e) => updateInvoiceRow(index, 'hours', e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Preis</Label>
                    <Input
                      className="bg-white border-slate-200 text-slate-900"
                      value={row.price}
                      onChange={(e) => updateInvoiceRow(index, 'price', e.target.value)}
                      placeholder="Pauschalpreis"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-slate-700 text-xs">Betrag (CHF)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-white border-slate-200 text-slate-900"
                      value={row.amount}
                      onChange={(e) => updateInvoiceRow(index, 'amount', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {formData.invoiceRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceRow(index)}
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

          {/* MwSt & Zahlungsbedingungen */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">MwSt & Zahlungsbedingungen</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isVatApplicable"
                  className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                  checked={formData.isVatApplicable}
                  onChange={(e) => handleChange('isVatApplicable', e.target.checked)}
                />
                <Label htmlFor="isVatApplicable" className="text-slate-700 font-medium cursor-pointer">
                  MwSt anwendbar
                </Label>
              </div>

              {formData.isVatApplicable && (
                <div>
                  <Label className="text-slate-700">MwSt-Satz (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    className="bg-white border-slate-200 text-slate-900"
                    value={formData.vatRate}
                    onChange={(e) => handleChange('vatRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}

              <div>
                <Label className="text-slate-700">Zahlungsbedingungen</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.paymentTerms}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  placeholder="z.B. Zahlbar innert 5 Tagen"
                />
              </div>

              <div>
                <Label className="text-slate-700">Zahlungsempfänger</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900"
                  value={formData.bankRecipientText}
                  onChange={(e) => handleChange('bankRecipientText', e.target.value)}
                  placeholder="Zahlungsempfänger: UBS, Umzug-Unit GmbH, IBAN..."
                />
              </div>

              <div>
                <Label className="text-slate-700">Bemerkungen (optional)</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Zusätzliche Bemerkungen zur Rechnung..."
                />
              </div>
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Preiskalkulation</h3>
            <div className="space-y-3 text-slate-700">
              {formData.isVatApplicable ? (
                <>
                  <div className="flex justify-between font-bold text-xl text-slate-900">
                    <span>SUMME inkl. {formData.vatRate}% MwSt:</span>
                    <span className="font-mono text-brand-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Zwischensumme:</span>
                      <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MwSt. ({formData.vatRate}%):</span>
                      <span className="font-mono">{formatCurrency(calculateVAT())}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-bold text-xl text-slate-900">
                  <span>Total CHF:</span>
                  <span className="font-mono text-brand-primary">{formatCurrency(calculateSubtotal())}</span>
                </div>
              )}
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
              {loading ? 'Erstelle Rechnung...' : 'Rechnung erstellen (PDF)'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInvoice
