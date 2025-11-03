import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase, getServiceCategories, getAdditionalServices, createOffer, createCustomer } from '@/lib/supabase'
import { generateOfferNumber, generateCustomerNumber } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const OfferForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  
  const [formData, setFormData] = useState({
    salutation: 'Herr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: 'umzug',
    fromStreet: '',
    fromCity: '',
    fromZip: '',
    fromFloor: 0,
    fromElevator: false,
    toStreet: '',
    toCity: '',
    toZip: '',
    toFloor: 0,
    toElevator: false,
    movingDate: '',
    startTime: '',
    selectedServices: [],
    notes: '',
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const { data: cats } = await getServiceCategories()
    const { data: addServices } = await getAdditionalServices()
    
    if (cats) setServices(cats)
    if (addServices) setAdditionalServices(addServices)
  }

  const calculateTotal = () => {
    let total = 0
    
    // Base price based on selected category
    const selectedCategory = services.find(s => s.category_id === formData.category)
    if (selectedCategory) {
      total += parseFloat(selectedCategory.base_price || 0)
    }
    
    // Add additional services
    formData.selectedServices.forEach(serviceId => {
      const service = additionalServices.find(s => s.service_id === serviceId)
      if (service) {
        total += parseFloat(service.price)
      }
    })
    
    // Add tax
    const taxRate = 7.7
    const tax = (total * taxRate) / 100
    
    return { subtotal: total, tax, total: total + tax }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create customer
      const customerData = {
        customer_number: generateCustomerNumber(),
        salutation: formData.salutation,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }

      const { data: customer, error: customerError } = await createCustomer(customerData)
      
      if (customerError) {
        toast.error('Error creating customer: ' + customerError.message)
        setLoading(false)
        return
      }

      // Generate offer number
      const offerNumber = await generateOfferNumber(supabase)
      
      // Calculate pricing
      const pricing = calculateTotal()

      // Create offer
      const offerData = {
        offer_number: offerNumber,
        customer_id: customer.id,
        category: formData.category,
        status: 'draft',
        customer_salutation: formData.salutation,
        customer_first_name: formData.firstName,
        customer_last_name: formData.lastName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        from_street: formData.fromStreet,
        from_city: formData.fromCity,
        from_zip: formData.fromZip,
        from_floor: formData.fromFloor,
        from_elevator: formData.fromElevator,
        to_street: formData.toStreet,
        to_city: formData.toCity,
        to_zip: formData.toZip,
        to_floor: formData.toFloor,
        to_elevator: formData.toElevator,
        moving_date: formData.movingDate,
        start_time: formData.startTime,
        selected_services: formData.selectedServices,
        notes: formData.notes,
        subtotal: pricing.subtotal,
        tax_amount: pricing.tax,
        total: pricing.total,
      }

      const { error: offerError } = await createOffer(offerData)
      
      if (offerError) {
        toast.error('Error creating offer: ' + offerError.message)
      } else {
        toast.success(t('offer.success'))
        navigate('/thank-you')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
  }

  const pricing = calculateTotal()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold mt-2 text-slate-900">{t('offer.title')}</h1>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{t('offer.customer_info')}</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-700">Salutation</Label>
                  <select
                    className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.salutation}
                    onChange={(e) => handleChange('salutation', e.target.value)}
                  >
                    <option>Herr</option>
                    <option>Frau</option>
                    <option>Divers</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-700">{t('offer.first_name')}</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">{t('offer.last_name')}</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">{t('common.email')}</Label>
                  <Input
                    type="email"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">{t('common.phone')}</Label>
                  <Input
                    type="tel"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{t('offer.service_selection')}</h2>
            </div>
            <div className="px-6 py-5">
              <Label className="text-slate-700">Service Type</Label>
              <select
                className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {services.map(service => (
                  <option key={service.category_id} value={service.category_id}>
                    {service.name_de}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Move Details */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{t('offer.move_details')}</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">{t('offer.date')}</Label>
                  <Input
                    type="date"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.movingDate}
                    onChange={(e) => handleChange('movingDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">{t('offer.time')}</Label>
                  <Input
                    type="time"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                  />
                </div>
              </div>
              
              <h4 className="font-semibold mt-4 text-slate-900">{t('offer.from_address')}</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Street</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromStreet}
                    onChange={(e) => handleChange('fromStreet', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">ZIP</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromZip}
                    onChange={(e) => handleChange('fromZip', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">City</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromCity}
                    onChange={(e) => handleChange('fromCity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">{t('offer.floor')}</Label>
                  <Input
                    type="number"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromFloor}
                    onChange={(e) => handleChange('fromFloor', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <h4 className="font-semibold mt-4 text-slate-900">{t('offer.to_address')}</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Street</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toStreet}
                    onChange={(e) => handleChange('toStreet', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">ZIP</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toZip}
                    onChange={(e) => handleChange('toZip', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">City</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toCity}
                    onChange={(e) => handleChange('toCity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">{t('offer.floor')}</Label>
                  <Input
                    type="number"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toFloor}
                    onChange={(e) => handleChange('toFloor', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{t('offer.additional_services')}</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {additionalServices.map(service => (
                <label key={service.service_id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20"
                    checked={formData.selectedServices.includes(service.service_id)}
                    onChange={() => toggleService(service.service_id)}
                  />
                  <span className="text-slate-700">{service.name_de} - CHF {service.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{t('offer.price_calculation')}</h2>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-3 text-slate-700">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-mono">CHF {pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax (7.7%):</span>
                  <span className="font-mono">CHF {pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-slate-900 border-t border-slate-200 pt-3">
                  <span>Total:</span>
                  <span className="font-mono text-brand-primary">CHF {pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-brand-primary hover:bg-[#d16635] text-white font-semibold" 
            disabled={loading}
          >
            {loading ? t('common.loading') : t('common.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default OfferForm
