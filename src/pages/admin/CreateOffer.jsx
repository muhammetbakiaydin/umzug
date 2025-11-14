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
  createCustomer, 
  getCustomers, 
  searchCustomers,
  getAllAdditionalServices,
  getCompanySettings
} from '@/lib/supabase'
import { generateOfferNumber, generateCustomerNumber } from '@/lib/utils'
import { ArrowLeft, Save, Search, Settings, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const CreateOffer = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  const [vatRate, setVatRate] = useState(7.7)
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [offerNumber, setOfferNumber] = useState('')
  const [vatEnabled, setVatEnabled] = useState(true)
  
  // Service category edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    pricing_model: 'fixed',
    base_price: 0,
    hourly_rate: 0
  })
  
  // Additional service edit modal state
  const [showEditAdditionalModal, setShowEditAdditionalModal] = useState(false)
  const [editingAdditionalService, setEditingAdditionalService] = useState(null)
  const [editAdditionalForm, setEditAdditionalForm] = useState({
    name: '',
    description: '',
    price: 0
  })
  
  const [formData, setFormData] = useState({
    // Document Details
    offerNumber: '',
    offerDate: new Date().toISOString().split('T')[0],
    customerNumber: '',
    contactPerson: '',
    serviceCategories: ['umzug'], // Changed to array for multi-select
    selectedCustomerId: null,
    
    // Current Address (Aktueller Standort)
    fromSalutation: 'Herr',
    fromFirstName: '',
    fromLastName: '',
    fromStreet: '',
    fromZip: '',
    fromCity: '',
    fromPhone: '',
    fromEmail: '',
    fromElevator: false,
    fromFloor: '',
    
    // New Address (Neuer Standort)
    toStreet: '',
    toZip: '',
    toCity: '',
    toElevator: false,
    toFloor: '',
    
    // Move Details (Umzugsdetails)
    movingDate: '',
    startTime: '',
    cleaningDate: '',
    cleaningStartTime: '',
    object: '',
    objectType: 'Wohnung',
    roomCount: 3,
    
    // Move Services (Umzugsleistungen)
    trucks: 1,
    workers: 2,
    hasTrailer: false,
    hasSprinter: false,
    boxesNote: '20 Umzugskisten Kostenlos zur Verfügung',
    assemblyNote: 'Inkl. De/Montage',
    flatRatePrice: 0,
    
    // Extra Services (Zusatzleistungen)
    extraCleaning: false,
    extraDisposal: false,
    extraPacking: false,
    
    notes: '',
    status: 'draft',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  // Auto-fill price when service categories change
  useEffect(() => {
    if (formData.serviceCategories && formData.serviceCategories.length > 0 && services.length > 0) {
      // Calculate total price from all selected services
      let totalPrice = 0
      
      formData.serviceCategories.forEach(categoryValue => {
        const selectedService = services.find(s => s.value === categoryValue)
        if (selectedService && selectedService.base_price) {
          totalPrice += Number(selectedService.base_price)
        }
      })
      
      // Only auto-fill if flatRatePrice is empty or 0
      if (totalPrice > 0 && (!formData.flatRatePrice || formData.flatRatePrice === 0)) {
        handleChange('flatRatePrice', totalPrice)
      }
    }
  }, [formData.serviceCategories, services, formData.workers])

  const loadInitialData = async () => {
    // Load service categories
    const { data: cats } = await getServiceCategories()
    if (cats) setServices(cats)
    
    // Load additional services
    const { data: addServices } = await getAllAdditionalServices()
    if (addServices) setAdditionalServices(addServices.filter(s => s.active))
    
    // Load VAT rate from company settings
    const { data: settings } = await getCompanySettings()
    if (settings) {
      if (settings.vat_rate) setVatRate(settings.vat_rate)
      if (settings.vat_enabled !== undefined) setVatEnabled(settings.vat_enabled)
    }
    
    // Load customers
    const { data: custs } = await getCustomers()
    if (custs) setCustomers(custs)
    
    // Generate offer number only
    const newOfferNumber = await generateOfferNumber(supabase)
    
    setOfferNumber(newOfferNumber)
    setFormData(prev => ({ 
      ...prev, 
      offerNumber: newOfferNumber
    }))
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
    if (customer === 'new') {
      // Reset to new customer
      setFormData(prev => ({
        ...prev,
        selectedCustomerId: null,
        customerNumber: '',
        contactPerson: '',
        fromSalutation: 'Herr',
        fromFirstName: '',
        fromLastName: '',
        fromStreet: '',
        fromZip: '',
        fromCity: '',
        fromPhone: '',
        fromEmail: '',
      }))
      setSearchTerm('-- Neuer Kunde (manuell eingeben) --')
    } else {
      // Fill from existing customer
      setFormData(prev => ({
        ...prev,
        selectedCustomerId: customer.id,
        customerNumber: customer.customer_number,
        contactPerson: `${customer.salutation || ''} ${customer.first_name} ${customer.last_name}`.trim(),
        fromSalutation: customer.salutation || 'Herr',
        fromFirstName: customer.first_name,
        fromLastName: customer.last_name,
        fromStreet: customer.address_street || '',
        fromZip: customer.address_zip || '',
        fromCity: customer.address_city || '',
        fromPhone: customer.phone,
        fromEmail: customer.email,
      }))
      setSearchTerm(`${customer.first_name} ${customer.last_name} (${customer.customer_number})`)
    }
    setShowCustomerDropdown(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(value).replace('CHF', 'CHF ')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.replace(':', '.')
  }

  const handleOpenEditModal = (service) => {
    setEditingService(service)
    setEditForm({
      name: service.name,
      description: service.description || '',
      pricing_model: service.pricing_model || 'fixed',
      base_price: service.base_price || 0,
      hourly_rate: service.hourly_rate || 0
    })
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingService(null)
    setEditForm({
      name: '',
      description: '',
      pricing_model: 'fixed',
      base_price: 0,
      hourly_rate: 0
    })
  }

  const handleSaveServiceCategory = async () => {
    if (!editForm.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    try {
      const { error } = await supabase
        .from('service_categories')
        .update({
          name: editForm.name,
          description: editForm.description,
          base_price: editForm.base_price
        })
        .eq('id', editingService.id)

      if (error) throw error

      // Reload services to get fresh data
      const { data: cats } = await getServiceCategories()
      if (cats) {
        setServices(cats)
        
        // Force recalculate price based on ALL selected service categories with updated data
        let totalPrice = 0
        formData.serviceCategories.forEach(categoryValue => {
          const selectedService = cats.find(s => s.value === categoryValue)
          if (selectedService && selectedService.base_price) {
            totalPrice += Number(selectedService.base_price)
          }
        })
        
        // Always update the price when saving (force update)
        if (formData.serviceCategories.length > 0) {
          setFormData(prev => ({
            ...prev,
            flatRatePrice: totalPrice
          }))
        }
      }

      toast.success('Service-Kategorie und Preis aktualisiert')
      handleCloseEditModal()
    } catch (error) {
      console.error('Error updating service category:', error)
      toast.error('Fehler beim Aktualisieren der Kategorie')
    }
  }

  const handleToggleServiceActive = async (serviceId, currentActive) => {
    try {
      const { error } = await supabase
        .from('service_categories')
        .update({ active: !currentActive })
        .eq('id', serviceId)

      if (error) throw error

      // Reload services
      const { data: cats } = await getServiceCategories()
      if (cats) setServices(cats)

      toast.success(`Service-Kategorie ${!currentActive ? 'aktiviert' : 'deaktiviert'}`)
    } catch (error) {
      console.error('Error toggling service:', error)
      toast.error('Fehler beim Ändern des Status')
    }
  }

  // Additional service edit handlers
  const handleOpenEditAdditionalModal = (service) => {
    setEditingAdditionalService(service)
    setEditAdditionalForm({
      name: service.name,
      description: service.description || '',
      price: service.price || 0
    })
    setShowEditAdditionalModal(true)
  }

  const handleCloseEditAdditionalModal = () => {
    setShowEditAdditionalModal(false)
    setEditingAdditionalService(null)
    setEditAdditionalForm({
      name: '',
      description: '',
      price: 0
    })
  }

  const handleSaveAdditionalService = async () => {
    if (!editAdditionalForm.name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein')
      return
    }

    try {
      const { error } = await supabase
        .from('additional_services')
        .update({
          name: editAdditionalForm.name,
          description: editAdditionalForm.description,
          price: editAdditionalForm.price
        })
        .eq('id', editingAdditionalService.id)

      if (error) throw error

      // Reload additional services
      const { data: services } = await getAllAdditionalServices()
      if (services) {
        setAdditionalServices(services.filter(s => s.active))
      }

      toast.success('Zusatzleistung aktualisiert')
      handleCloseEditAdditionalModal()
    } catch (error) {
      console.error('Error updating additional service:', error)
      toast.error('Fehler beim Aktualisieren der Zusatzleistung')
    }
  }

  const handleToggleAdditionalServiceActive = async (serviceId, currentActive) => {
    try {
      const { error } = await supabase
        .from('additional_services')
        .update({ active: !currentActive })
        .eq('id', serviceId)

      if (error) throw error

      // Reload additional services
      const { data: services } = await getAllAdditionalServices()
      if (services) {
        setAdditionalServices(services.filter(s => s.active))
      }

      toast.success(`Zusatzleistung ${!currentActive ? 'aktiviert' : 'deaktiviert'}`)
    } catch (error) {
      console.error('Error toggling additional service:', error)
      toast.error('Fehler beim Ändern des Status')
    }
  }

  const calculateAdditionalServicesTotal = () => {
    let total = 0
    
    additionalServices.forEach((service) => {
      const fieldNameMap = {
        'Reinigung': 'extraCleaning',
        'Entsorgung': 'extraDisposal',
        'Verpackungsservice': 'extraPacking'
      }
      const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
      
      if (formData[fieldName] && service.price) {
        total += Number(getAdjustedServicePrice(service))
      }
    })
    
    return total
  }

  const getAdjustedServicePrice = (service) => {
    // For "Stundensatz" service, add CHF 30 for each worker above 2
    if (service.name === 'Stundensatz' || service.name.toLowerCase().includes('stundensatz')) {
      const basePrice = Number(service.price) || 0
      const workers = formData.workers || 2
      if (workers > 2) {
        const additionalWorkers = workers - 2
        return basePrice + (additionalWorkers * 30)
      }
      return basePrice
    }
    return Number(service.price) || 0
  }

  const calculateSubtotal = () => {
    return (formData.flatRatePrice || 0) + calculateAdditionalServicesTotal()
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    if (vatEnabled) {
      return subtotal + (subtotal * vatRate) / 100
    }
    return subtotal
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate at least one service category is selected
    if (!formData.serviceCategories || formData.serviceCategories.length === 0) {
      toast.error('Bitte wählen Sie mindestens eine Service-Kategorie aus')
      setLoading(false)
      return
    }
    
    setLoading(true)

    try {
      let customerId = formData.selectedCustomerId

      // Create new customer if not selected
      if (!customerId) {
        const customerData = {
          customer_number: generateCustomerNumber(),
          salutation: formData.fromSalutation,
          first_name: formData.fromFirstName,
          last_name: formData.fromLastName,
          email: formData.fromEmail,
          phone: formData.fromPhone,
          address_street: formData.fromStreet,
          address_zip: formData.fromZip,
          address_city: formData.fromCity,
        }

        const { data: customer, error: customerError } = await createCustomer(customerData)
        
        if (customerError) {
          toast.error('Fehler beim Erstellen des Kunden: ' + customerError.message)
          setLoading(false)
          return
        }
        customerId = customer.id
      }

      // Create offer
      const offerData = {
        document_type: 'offer',
        offer_number: formData.offerNumber,
        offer_date: formData.offerDate,
        customer_id: customerId,
        customer_number: formData.customerNumber || generateCustomerNumber(),
        contact_person: formData.contactPerson,
        category: formData.serviceCategories.join(','), // Store as comma-separated string
        status: formData.status,
        
        // Current address
        from_salutation: formData.fromSalutation,
        from_first_name: formData.fromFirstName,
        from_last_name: formData.fromLastName,
        from_street: formData.fromStreet,
        from_zip: formData.fromZip,
        from_city: formData.fromCity,
        from_phone: formData.fromPhone,
        from_email: formData.fromEmail,
        from_elevator: formData.fromElevator,
        from_floor: formData.fromFloor ? parseInt(formData.fromFloor) : null,
        
        // New address
        to_street: formData.toStreet,
        to_zip: formData.toZip,
        to_city: formData.toCity,
        to_elevator: formData.toElevator,
        to_floor: formData.toFloor ? parseInt(formData.toFloor) : null,
        
        // Move details
        moving_date: formData.movingDate,
        start_time: formData.startTime,
        cleaning_date: formData.cleaningDate || null,
        cleaning_start_time: formData.cleaningStartTime || null,
        object_description: formData.object,
        object_type: formData.objectType,
        room_count: formData.roomCount,
        
        // Move services
        trucks: formData.trucks,
        workers: formData.workers,
        has_trailer: formData.hasTrailer,
        has_sprinter: formData.hasSprinter,
        boxes_note: formData.boxesNote,
        assembly_note: formData.assemblyNote,
        flat_rate_price: formData.flatRatePrice,
        
        // Extra services (keep old fields for compatibility + add new JSON field)
        extra_cleaning: formData.extraCleaning,
        extra_disposal: formData.extraDisposal,
        extra_packing: formData.extraPacking,
        additional_services: JSON.stringify(
          additionalServices
            .filter(service => {
              const fieldNameMap = {
                'Reinigung': 'extraCleaning',
                'Entsorgung': 'extraDisposal',
                'Verpackungsservice': 'extraPacking'
              }
              const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
              return formData[fieldName] === true
            })
            .map(service => ({
              id: service.id,
              name: service.name,
              price: getAdjustedServicePrice(service), // Use adjusted price
              base_price: service.price, // Keep original base price
              selected: true
            }))
        ),
        
        // Pricing
        subtotal: calculateSubtotal(),
        tax_rate: vatEnabled ? vatRate : 0,
        tax_amount: vatEnabled ? (calculateSubtotal() * vatRate) / 100 : 0,
        total: calculateTotal(),
        
        notes: formData.notes,
        
        // Created by
        created_by_user_id: user?.id,
        created_by_name: user?.email,
      }

      const { data: offer, error: offerError } = await createOffer(offerData)
      
      if (offerError) {
        toast.error('Fehler beim Erstellen des Angebots: ' + offerError.message)
      } else {
        toast.success('Angebot erfolgreich erstellt!')
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
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-secondary">
            Neues Angebot erstellen
          </h1>
          <div className="text-slate-600 text-sm">
            Erstellt von: <span className="font-semibold text-brand-secondary">{user?.email || 'Admin'}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Offerten-Details */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Offerten-Details</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Customer Selection */}
              <div className="relative">
                <Label className="text-slate-700">Kunde auswählen (Optional)</Label>
                <div className="relative">
                  <Input
                    className="bg-white border-slate-200 text-slate-900 pr-10"
                    value={searchTerm}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Kunde suchen oder 'Neuer Kunde' auswählen..."
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-600" />
                </div>
                
                {showCustomerDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-brand-primary font-semibold border-b border-slate-200"
                      onClick={() => selectCustomer('new')}
                    >
                      -- Neuer Kunde (manuell eingeben) --
                    </div>
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-900"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="font-semibold">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-slate-600">
                          {customer.customer_number} • {customer.email}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Offert Nr. *</Label>
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    value={formData.offerNumber}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Offertdatum *</Label>
                  <Input
                    type="date"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.offerDate}
                    onChange={(e) => handleChange('offerDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Kundennummer</Label>
                  <Input
                    className={`border-slate-200 text-slate-900 ${formData.selectedCustomerId ? 'bg-slate-700' : 'bg-white'}`}
                    value={formData.customerNumber}
                    onChange={(e) => handleChange('customerNumber', e.target.value)}
                    readOnly={!!formData.selectedCustomerId}
                    placeholder="Wird automatisch generiert"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Ansprechpartner</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    placeholder="z.B. Herr Minerva Marco"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Service-Kategorien *</Label>
                  <div className="border border-slate-200 rounded-md p-4 bg-white space-y-3">
                    {services.map(service => {
                      const isSelected = formData.serviceCategories.includes(service.value)
                      return (
                        <div key={service.id} className="flex items-start space-x-3 group">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={isSelected}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...formData.serviceCategories, service.value]
                                : formData.serviceCategories.filter(cat => cat !== service.value)
                              handleChange('serviceCategories', newCategories)
                            }}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-slate-900">
                              {service.name}
                              {service.base_price && Number(service.base_price) > 0
                                ? ` - CHF ${Number(service.base_price).toFixed(2)}`
                                : ''}
                            </div>
                            {service.description && (
                              <div className="text-xs text-slate-600 mt-0.5">{service.description}</div>
                            )}
                          </label>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(service)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-brand-primary transition-colors"
                              title="Bearbeiten"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleServiceActive(service.id, service.active)
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                service.active !== false ? 'bg-brand-primary' : 'bg-slate-300'
                              }`}
                              title={service.active !== false ? 'Aktiv' : 'Inaktiv'}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  service.active !== false ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {formData.serviceCategories.length === 0 && (
                    <p className="text-xs text-red-600 mt-1.5">Bitte wählen Sie mindestens eine Kategorie aus</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Status</Label>
                  <select
                    className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="draft">Entwurf</option>
                    <option value="sent">Gesendet</option>
                    <option value="accepted">Akzeptiert</option>
                    <option value="rejected">Abgelehnt</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Aktueller Standort */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Aktueller Standort</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-700">Anrede *</Label>
                  <select
                    className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromSalutation}
                    onChange={(e) => handleChange('fromSalutation', e.target.value)}
                    required
                  >
                    <option>Herr</option>
                    <option>Frau</option>
                    <option>Divers</option>
                  </select>
                </div>
                <div>
                  <Label className="text-slate-700">Vorname *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromFirstName}
                    onChange={(e) => handleChange('fromFirstName', e.target.value)}
                    required
                    placeholder="Vorname"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Nachname *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromLastName}
                    onChange={(e) => handleChange('fromLastName', e.target.value)}
                    required
                    placeholder="Nachname"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Strasse *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromStreet}
                    onChange={(e) => handleChange('fromStreet', e.target.value)}
                    required
                    placeholder="Strassenname und Hausnummer"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">PLZ *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromZip}
                    onChange={(e) => handleChange('fromZip', e.target.value)}
                    required
                    placeholder="z.B. CH-4132"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Ort *</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.fromCity}
                  onChange={(e) => handleChange('fromCity', e.target.value)}
                  required
                  placeholder="z.B. Muttenz"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Telefon *</Label>
                  <Input
                    type="tel"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromPhone}
                    onChange={(e) => handleChange('fromPhone', e.target.value)}
                    required
                    placeholder="+41 00 000 00 00"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">E-Mail *</Label>
                  <Input
                    type="email"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromEmail}
                    onChange={(e) => handleChange('fromEmail', e.target.value)}
                    required
                    placeholder="email@beispiel.ch"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Etage *</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.fromFloor}
                  onChange={(e) => handleChange('fromFloor', e.target.value)}
                  required
                  placeholder="z.B. 2"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="fromElevator"
                  checked={formData.fromElevator}
                  onChange={(e) => handleChange('fromElevator', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-200 text-brand-primary focus:ring-yellow-400 focus:ring-offset-slate-800"
                  role="switch"
                />
                <Label htmlFor="fromElevator" className="text-slate-300 cursor-pointer">
                  Lift vorhanden
                </Label>
              </div>
            </div>
          </div>

          {/* Neuer Standort */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Neuer Standort</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Strasse *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toStreet}
                    onChange={(e) => handleChange('toStreet', e.target.value)}
                    required
                    placeholder="Strassenname und Hausnummer"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">PLZ *</Label>
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toZip}
                    onChange={(e) => handleChange('toZip', e.target.value)}
                    required
                    placeholder="z.B. CH-4132"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Ort *</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.toCity}
                  onChange={(e) => handleChange('toCity', e.target.value)}
                  required
                  placeholder="z.B. Muttenz"
                />
              </div>

              <div>
                <Label className="text-slate-700">Etage *</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.toFloor}
                  onChange={(e) => handleChange('toFloor', e.target.value)}
                  required
                  placeholder="z.B. 3"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="toElevator"
                  checked={formData.toElevator}
                  onChange={(e) => handleChange('toElevator', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-200 text-brand-primary focus:ring-yellow-400 focus:ring-offset-slate-800"
                  role="switch"
                />
                <Label htmlFor="toElevator" className="text-slate-300 cursor-pointer">
                  Lift vorhanden
                </Label>
              </div>
            </div>
          </div>

          {/* Umzugsdetails */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Umzugsdetails</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Umzugstermin *</Label>
                  <Input
                    type="date"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.movingDate}
                    onChange={(e) => handleChange('movingDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Arbeitsbeginn *</Label>
                  <Input
                    type="time"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    required
                    placeholder="z.B. 08:00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Reinigungstermin (optional)</Label>
                  <Input
                    type="date"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.cleaningDate}
                    onChange={(e) => handleChange('cleaningDate', e.target.value)}
                    placeholder="oder 'offen'"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Reinigung Arbeitsbeginn (optional)</Label>
                  <Input
                    type="time"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.cleaningStartTime}
                    onChange={(e) => handleChange('cleaningStartTime', e.target.value)}
                    placeholder="oder 'offen'"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Objekttyp *</Label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleChange('objectType', 'Wohnung')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formData.objectType === 'Wohnung'
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-primary/50'
                    }`}
                  >
                    Wohnung
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('objectType', 'Haus')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formData.objectType === 'Haus'
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-primary/50'
                    }`}
                  >
                    Haus
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Anzahl Zimmer *</Label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => handleChange('roomCount', Math.max(1, formData.roomCount - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-slate-200 bg-white text-slate-700 hover:border-brand-primary hover:text-brand-primary font-bold text-xl"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      className="bg-white border-slate-200 text-slate-900 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.roomCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        handleChange('roomCount', Math.max(1, Math.min(10, val)))
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('roomCount', Math.min(10, formData.roomCount + 1))}
                    className="w-10 h-10 rounded-lg border-2 border-slate-200 bg-white text-slate-700 hover:border-brand-primary hover:text-brand-primary font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">Zwischen 1 und 10 Zimmer</p>
              </div>

              <div>
                <Label className="text-slate-700">Zusätzliche Objektbeschreibung (optional)</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.object}
                  onChange={(e) => handleChange('object', e.target.value)}
                  placeholder='z.B. "Mit Balkon, Einbauküche, etc."'
                />
              </div>
            </div>
          </div>

          {/* Umzugsleistungen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Umzugsleistungen</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Umzugswagen (Anzahl)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.trucks}
                    onChange={(e) => handleChange('trucks', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Umzugsmitarbeiter (Anzahl)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.workers}
                    onChange={(e) => handleChange('workers', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <input
                    type="checkbox"
                    id="hasTrailer"
                    className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    checked={formData.hasTrailer}
                    onChange={(e) => handleChange('hasTrailer', e.target.checked)}
                  />
                  <Label htmlFor="hasTrailer" className="text-slate-700 font-medium cursor-pointer">
                    Anhänger
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <input
                    type="checkbox"
                    id="hasSprinter"
                    className="w-5 h-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                    checked={formData.hasSprinter}
                    onChange={(e) => handleChange('hasSprinter', e.target.checked)}
                  />
                  <Label htmlFor="hasSprinter" className="text-slate-700 font-medium cursor-pointer">
                    Sprinter
                  </Label>
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Umzugskisten</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.boxesNote}
                  onChange={(e) => handleChange('boxesNote', e.target.value)}
                  placeholder="z.B. 20 Umzugskisten Kostenlos zur Verfügung"
                />
              </div>

              <div>
                <Label className="text-slate-700">De/Montage</Label>
                <Input
                  className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.assemblyNote}
                  onChange={(e) => handleChange('assemblyNote', e.target.value)}
                  placeholder="z.B. Inkl. De/Montage"
                />
              </div>

              <div>
                <Label className="text-slate-700">Pauschalpreis Umzug (CHF)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary flex-1"
                    value={formData.flatRatePrice}
                    onChange={(e) => handleChange('flatRatePrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      let totalPrice = 0
                      const categoryNames = []
                      
                      formData.serviceCategories.forEach(categoryValue => {
                        const selectedService = services.find(s => s.value === categoryValue)
                        if (selectedService) {
                          categoryNames.push(selectedService.name)
                          if (selectedService.pricing_model === 'fixed' && selectedService.base_price) {
                            totalPrice += Number(selectedService.base_price)
                          } else if (selectedService.pricing_model === 'hourly' && selectedService.hourly_rate) {
                            const estimatedHours = 4
                            totalPrice += Number(selectedService.hourly_rate) * estimatedHours * (formData.workers || 2)
                          }
                        }
                      })
                      
                      if (totalPrice > 0) {
                        handleChange('flatRatePrice', totalPrice)
                        toast.success(`Preis von ${categoryNames.length} Kategorie(n) übernommen`)
                      } else {
                        toast.error('Keine Preisangabe in den ausgewählten Kategorien gefunden')
                      }
                    }}
                    className="whitespace-nowrap"
                  >
                    Preis übernehmen
                  </Button>
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Anzeige: {formatCurrency(formData.flatRatePrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Zusatzleistungen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Zusatzleistungen</h3>
              <p className="text-sm text-slate-600 mt-1">Klicken Sie zum Aktivieren</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {additionalServices.map((service) => {
                // Map service names to correct form field names
                const fieldNameMap = {
                  'Reinigung': 'extraCleaning',
                  'Entsorgung': 'extraDisposal',
                  'Verpackungsservice': 'extraPacking'
                }
                const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
                const adjustedPrice = getAdjustedServicePrice(service)
                const isStundensatz = service.name === 'Stundensatz' || service.name.toLowerCase().includes('stundensatz')
                const hasWorkerBonus = isStundensatz && formData.workers > 2
                
                return (
                  <div key={service.id} className="group flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Label htmlFor={fieldName} className="text-slate-700 cursor-pointer font-medium">
                          {service.name}
                        </Label>
                        {service.price && (
                          <span className="text-sm font-semibold text-brand-primary">
                            CHF {adjustedPrice.toFixed(2)}
                            {hasWorkerBonus && (
                              <span className="ml-1 text-xs text-slate-600">
                                (Basis: {Number(service.price).toFixed(2)} + {((formData.workers - 2) * 30).toFixed(2)})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAdditionalModal(service)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-brand-primary transition-colors"
                          title="Bearbeiten"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleAdditionalServiceActive(service.id, service.active)
                          }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            service.active !== false ? 'bg-brand-primary' : 'bg-slate-300'
                          }`}
                          title={service.active !== false ? 'Aktiv' : 'Inaktiv'}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              service.active !== false ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <input
                        type="checkbox"
                        id={fieldName}
                        checked={formData[fieldName] || false}
                        onChange={(e) => handleChange(fieldName, e.target.checked)}
                        className="w-5 h-5 rounded border-slate-200 text-brand-primary focus:ring-yellow-400 focus:ring-offset-slate-800"
                        role="switch"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notizen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Notizen</h3>
            </div>
            <div className="px-6 py-5">
              <textarea
                className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Zusätzliche Notizen oder besondere Anforderungen..."
              />
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Preiskalkulation</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-3 text-slate-700">
                <div className="flex justify-between text-base">
                  <span>Pauschalpreis Umzug:</span>
                  <span className="font-mono">{formatCurrency(formData.flatRatePrice || 0)}</span>
                </div>
                {calculateAdditionalServicesTotal() > 0 && (
                  <>
                    {additionalServices.map((service) => {
                      const fieldNameMap = {
                        'Reinigung': 'extraCleaning',
                        'Entsorgung': 'extraDisposal',
                        'Verpackungsservice': 'extraPacking'
                      }
                      const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
                      
                      if (formData[fieldName] && service.price) {
                        const adjustedPrice = getAdjustedServicePrice(service)
                        return (
                          <div key={service.id} className="flex justify-between text-base">
                            <span>{service.name}:</span>
                            <span className="font-mono">{formatCurrency(adjustedPrice)}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                    <div className="flex justify-between text-base font-semibold border-t border-slate-200 pt-2">
                      <span>Zwischensumme:</span>
                      <span className="font-mono">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                  </>
                )}
                {!calculateAdditionalServicesTotal() && (
                  <div className="flex justify-between text-base">
                    <span>Zwischensumme:</span>
                    <span className="font-mono">{formatCurrency(formData.flatRatePrice || 0)}</span>
                  </div>
                )}
                {vatEnabled && (
                  <div className="flex justify-between text-base">
                    <span>MwSt. ({vatRate}%):</span>
                    <span className="font-mono">{formatCurrency((calculateSubtotal() * vatRate) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl text-slate-900 border-t-2 border-slate-300 pt-3">
                  <span>Total:</span>
                  <span className="font-mono text-brand-primary">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              size="lg" 
              className="flex-1 bg-brand-primary hover:bg-[#d16635] text-slate-900 font-bold"
              disabled={loading}
            >
              <Save className="mr-2 h-5 w-5" />
              {loading ? 'Erstelle Angebot...' : 'Angebot erstellen'}
            </Button>
          </div>
        </form>
      </div>

      {/* Edit Service Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Service-Kategorie bearbeiten</h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Umzug"
                  className="!bg-white !border-slate-300 !text-slate-900 placeholder:!text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Beschreibung</Label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung der Dienstleistung..."
                  className="w-full min-h-[80px] rounded-md border border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Basispreis (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.base_price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="!bg-white !border-slate-300 !text-slate-900 placeholder:!text-slate-400"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditModal}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={handleSaveServiceCategory}
                className="bg-brand-primary hover:bg-[#d16635] text-slate-900"
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Additional Service Modal */}
      {showEditAdditionalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Zusatzleistung bearbeiten</h2>
              <button
                onClick={handleCloseEditAdditionalModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Name *</Label>
                <Input
                  value={editAdditionalForm.name}
                  onChange={(e) => setEditAdditionalForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Reinigung"
                  className="!bg-white !border-slate-300 !text-slate-900 placeholder:!text-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Beschreibung</Label>
                <textarea
                  value={editAdditionalForm.description}
                  onChange={(e) => setEditAdditionalForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung der Zusatzleistung..."
                  className="w-full min-h-[80px] rounded-md border border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>

              <div>
                <Label className="text-slate-900 font-semibold block mb-2">Preis (CHF)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAdditionalForm.price}
                  onChange={(e) => setEditAdditionalForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="!bg-white !border-slate-300 !text-slate-900 placeholder:!text-slate-400"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditAdditionalModal}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={handleSaveAdditionalService}
                className="bg-brand-primary hover:bg-[#d16635] text-slate-900"
              >
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateOffer
