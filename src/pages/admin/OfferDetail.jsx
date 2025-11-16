import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getOffer, updateOffer, getServiceCategories, getAllAdditionalServices, getCompanySettings } from '@/lib/supabase'
import { ArrowLeft, Save, FileDown, Edit, X, Mail, MoreVertical } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { sendOfferEmail } from '@/lib/email'

const OfferDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [offer, setOffer] = useState(null)
  const [services, setServices] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  const [formData, setFormData] = useState({})
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [vatEnabled, setVatEnabled] = useState(true)
  const [vatRate, setVatRate] = useState(7.7)

  useEffect(() => {
    loadOffer()
    loadServices()
    loadAdditionalServices()
    loadCompanySettings()
  }, [id])

  const loadServices = async () => {
    const { data: cats } = await getServiceCategories()
    if (cats) setServices(cats)
  }

  const loadAdditionalServices = async () => {
    const { data: addServices } = await getAllAdditionalServices()
    if (addServices) setAdditionalServices(addServices.filter(s => s.active))
  }

  const loadCompanySettings = async () => {
    const { data: settings } = await getCompanySettings()
    if (settings) {
      setVatEnabled(settings.vat_enabled !== false)
      if (settings.vat_rate) setVatRate(settings.vat_rate)
    }
  }

  const loadOffer = async () => {
    setLoading(true)
    const { data, error } = await getOffer(id)
    
    if (error) {
      toast.error('Fehler beim Laden des Angebots')
      navigate('/admin/offers')
      return
    }

    setOffer(data)
    setFormData({
      offerDate: data.offer_date || '',
      contactPerson: data.contact_person || '',
      serviceCategories: data.category ? data.category.split(',') : ['umzug'], // Parse comma-separated string to array
      status: data.status || 'draft',
      
      fromSalutation: data.from_salutation || 'Herr',
      fromFirstName: data.from_first_name || '',
      fromLastName: data.from_last_name || '',
      fromStreet: data.from_street || '',
      fromZip: data.from_zip || '',
      fromCity: data.from_city || '',
      fromPhone: data.from_phone || '',
      fromEmail: data.from_email || '',
      fromElevator: data.from_elevator || false,
      fromFloor: data.from_floor || 0,
      
      toStreet: data.to_street || '',
      toZip: data.to_zip || '',
      toCity: data.to_city || '',
      toElevator: data.to_elevator || false,
      toFloor: data.to_floor || 0,
      
      movingDate: data.moving_date || '',
      startTime: data.start_time || '',
      cleaningDate: data.cleaning_date || '',
      cleaningStartTime: data.cleaning_start_time || '',
      object: data.object_description || '',
      objectType: data.object_type || 'Wohnung',
      roomCount: data.room_count || 3,
      
      trucks: data.trucks || 1,
      workers: data.workers || 2,
      hasTrailer: data.has_trailer || false,
      hasSprinter: data.has_sprinter || false,
      boxesNote: data.boxes_note || '20 Umzugskisten Kostenlos zur Verfügung',
      assemblyNote: data.assembly_note || 'Inkl. De/Montage',
      flatRatePrice: data.flat_rate_price || 0,
      
      extraCleaning: data.extra_cleaning || false,
      extraDisposal: data.extra_disposal || false,
      extraPacking: data.extra_packing || false,
      
      notes: data.notes || '',
    })
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const updateData = {
        offer_date: formData.offerDate,
        contact_person: formData.contactPerson,
        category: formData.serviceCategories.join(','), // Convert array to comma-separated string
        status: formData.status,
        
        from_salutation: formData.fromSalutation,
        from_first_name: formData.fromFirstName,
        from_last_name: formData.fromLastName,
        from_street: formData.fromStreet,
        from_zip: formData.fromZip,
        from_city: formData.fromCity,
        from_phone: formData.fromPhone,
        from_email: formData.fromEmail,
        from_elevator: formData.fromElevator,
        from_floor: parseInt(formData.fromFloor) || 0,
        
        to_street: formData.toStreet,
        to_zip: formData.toZip,
        to_city: formData.toCity,
        to_elevator: formData.toElevator,
        to_floor: parseInt(formData.toFloor) || 0,
        
        moving_date: formData.movingDate,
        start_time: formData.startTime,
        cleaning_date: formData.cleaningDate || null,
        cleaning_start_time: formData.cleaningStartTime || null,
        object_description: formData.object,
        object_type: formData.objectType,
        room_count: parseInt(formData.roomCount) || 3,
        
        trucks: formData.trucks,
        workers: formData.workers,
        has_trailer: formData.hasTrailer,
        has_sprinter: formData.hasSprinter,
        boxes_note: formData.boxesNote,
        assembly_note: formData.assemblyNote,
        flat_rate_price: formData.flatRatePrice,
        
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
        
        subtotal: calculateSubtotal(),
        tax_rate: vatEnabled ? vatRate : 0,
        tax_amount: vatEnabled ? (calculateSubtotal() * vatRate) / 100 : 0,
        total: calculateTotal(),
        
        notes: formData.notes,
      }

      const { error } = await updateOffer(id, updateData)
      
      if (error) {
        toast.error('Fehler beim Speichern: ' + error.message)
      } else {
        toast.success('Angebot erfolgreich aktualisiert!')
        setEditMode(false)
        loadOffer()
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setSaving(false)
    }
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

  const getSelectedAdditionalServices = () => {
    // First try to get from saved JSON which has adjusted prices
    if (offer && offer.additional_services) {
      try {
        const services = JSON.parse(offer.additional_services)
        return services
      } catch (e) {
        console.error('Error parsing additional_services:', e)
      }
    }
    
    // Fallback to old format
    const selected = []
    additionalServices.forEach((service) => {
      const fieldNameMap = {
        'Reinigung': 'extraCleaning',
        'Entsorgung': 'extraDisposal',
        'Verpackungsservice': 'extraPacking'
      }
      const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
      const isChecked = editMode ? formData[fieldName] : offer?.[fieldName.replace(/([A-Z])/g, '_$1').toLowerCase()]
      
      if (isChecked) {
        selected.push({
          id: service.id,
          name: service.name,
          price: service.price,
          base_price: service.price,
          selected: true
        })
      }
    })
    return selected
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

  const calculateAdditionalServicesTotal = () => {
    // When in edit mode, recalculate with adjusted prices
    if (editMode) {
      let total = 0
      additionalServices.forEach((service) => {
        const fieldNameMap = {
          'Reinigung': 'extraCleaning',
          'Entsorgung': 'extraDisposal',
          'Verpackungsservice': 'extraPacking'
        }
        const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
        
        if (formData[fieldName]) {
          total += getAdjustedServicePrice(service)
        }
      })
      return total
    }
    
    // When viewing, use saved prices from JSON
    const services = getSelectedAdditionalServices()
    return services.reduce((total, service) => total + Number(service.price || 0), 0)
  }

  const calculateSubtotal = () => {
    const basePrice = editMode ? (formData.flatRatePrice || 0) : (offer?.flat_rate_price || 0)
    return basePrice + calculateAdditionalServicesTotal()
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    if (vatEnabled) {
      return subtotal + (subtotal * vatRate) / 100
    }
    return subtotal
  }

  const exportPDF = () => {
    if (!offer) return
    
    // Determine the document type and set appropriate title
    const docType = offer.document_type || 'offer'
    const docNumber = docType === 'receipt' ? offer.receipt_number : 
                      docType === 'invoice' ? offer.invoice_number : 
                      offer.offer_number
    
    const docTitle = docType === 'receipt' ? 'Quittung' : 
                     docType === 'invoice' ? 'Rechnung' : 
                     'Offerte'
    
    // Set document title for PDF filename
    document.title = `${docTitle}_${docNumber}`
    
    // Determine the print URL based on document type
    const printUrl = docType === 'receipt' ? `/admin/receipts/${id}/print` :
                     docType === 'invoice' ? `/admin/invoices/${id}/print` :
                     `/admin/offers/${id}/print`
    
    // Open the print route in a new window
    const printWindow = window.open(printUrl, '_blank')
    
    if (printWindow) {
      toast.success('PDF-Druckvorschau wird geöffnet...')
    } else {
      toast.error('Popup wurde blockiert. Bitte erlauben Sie Popups für diese Seite.')
    }
  }

  const handleOpenEmailDialog = () => {
    setRecipientEmail(offer?.from_email || '')
    setShowEmailDialog(true)
  }

  const handleSendEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }

    setSendingEmail(true)
    
    try {
      // Get base URL for public offer link
      const baseUrl = window.location.origin
      await sendOfferEmail(offer, recipientEmail, baseUrl)
      toast.success(`Offerte mit Bestätigungslink erfolgreich an ${recipientEmail} gesendet!`)
      setShowEmailDialog(false)
      setRecipientEmail('')
    } catch (error) {
      console.error('Email send error:', error)
      toast.error('Fehler beim Versenden der E-Mail: ' + error.message)
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Lädt...</div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-900 text-xl">Angebot nicht gefunden</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Angebot {offer.offer_number}</h1>
              <p className="text-slate-600 mt-1">Erstellt von: {offer.created_by_name || 'N/A'}</p>
            </div>
            
            {/* Desktop buttons */}
            <div className="hidden md:flex gap-2">
              {!editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </Button>
                  <Button
                    onClick={handleOpenEmailDialog}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Per E-Mail senden
                  </Button>
                  <Button
                    onClick={exportPDF}
                    className="bg-brand-primary hover:bg-[#d16635] text-white"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF exportieren
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-primary hover:bg-[#d16635] text-white font-semibold"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Speichert...' : 'Speichern'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditMode(false)
                      loadOffer()
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </>
              )}
            </div>

            {/* Mobile dropdown menu */}
            <div className="relative md:hidden">
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="bg-slate-700 hover:bg-slate-800 text-white"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
              
              {showMobileMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMobileMenu(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-2">
                    {!editMode ? (
                      <>
                        <button
                          onClick={() => {
                            setEditMode(true)
                            setShowMobileMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center text-slate-900"
                        >
                          <Edit className="mr-3 h-4 w-4" />
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => {
                            handleOpenEmailDialog()
                            setShowMobileMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center text-slate-900"
                        >
                          <Mail className="mr-3 h-4 w-4" />
                          Per E-Mail senden
                        </button>
                        <button
                          onClick={() => {
                            exportPDF()
                            setShowMobileMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center text-slate-900"
                        >
                          <FileDown className="mr-3 h-4 w-4" />
                          PDF exportieren
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            handleSave()
                            setShowMobileMenu(false)
                          }}
                          disabled={saving}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center text-slate-900 disabled:opacity-50"
                        >
                          <Save className="mr-3 h-4 w-4" />
                          {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false)
                            loadOffer()
                            setShowMobileMenu(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center text-slate-900"
                        >
                          <X className="mr-3 h-4 w-4" />
                          Abbrechen
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="space-y-4">
          {/* Offerten-Details */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Offerten-Details</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Offert Nr.</Label>
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    value={offer.offer_number}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Offertdatum</Label>
                  {editMode ? (
                    <Input
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.offerDate}
                      onChange={(e) => handleChange('offerDate', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={formatDate(offer.offer_date)}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Kundennummer</Label>
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.customer_number || 'N/A'}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Ansprechpartner</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.contact_person || 'N/A'}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Service-Kategorien</Label>
                  {editMode ? (
                    <div className="border border-slate-200 rounded-md p-4 bg-white space-y-3">
                      {services.map(service => {
                        const isSelected = formData.serviceCategories.includes(service.value)
                        return (
                          <div key={service.id} className="flex items-start space-x-3">
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
                                {service.pricing_model === 'hourly' && service.hourly_rate 
                                  ? ` - CHF ${Number(service.hourly_rate).toFixed(2)}/Std`
                                  : service.pricing_model === 'fixed' && service.base_price
                                  ? ` - CHF ${Number(service.base_price).toFixed(2)}`
                                  : ''}
                              </div>
                              {service.description && (
                                <div className="text-xs text-slate-600 mt-0.5">{service.description}</div>
                              )}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                      {offer.category ? offer.category.split(',').map((cat, idx) => {
                        const selectedService = services.find(s => s.value === cat.trim())
                        return (
                          <div key={idx} className="flex items-center gap-2 mb-1 last:mb-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-brand-primary"></span>
                            <span className="text-slate-900 font-medium">
                              {selectedService ? selectedService.name : cat}
                            </span>
                          </div>
                        )
                      }) : 'Keine Kategorie ausgewählt'}
                    </div>
                  )}
                  {editMode && formData.serviceCategories.length === 0 && (
                    <p className="text-xs text-red-600 mt-1.5">Bitte wählen Sie mindestens eine Kategorie aus</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Status</Label>
                  {editMode ? (
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
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.status}
                      readOnly
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Aktueller Standort */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Aktueller Standort</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-700">Anrede</Label>
                  {editMode ? (
                    <select
                      className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromSalutation}
                      onChange={(e) => handleChange('fromSalutation', e.target.value)}
                    >
                      <option>Herr</option>
                      <option>Frau</option>
                      <option>Divers</option>
                    </select>
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_salutation || ''}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Vorname</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromFirstName}
                      onChange={(e) => handleChange('fromFirstName', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_first_name || ''}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Nachname</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromLastName}
                      onChange={(e) => handleChange('fromLastName', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_last_name || ''}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Strasse</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromStreet}
                      onChange={(e) => handleChange('fromStreet', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_street || ''}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">PLZ</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromZip}
                      onChange={(e) => handleChange('fromZip', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_zip || ''}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Ort</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromCity}
                    onChange={(e) => handleChange('fromCity', e.target.value)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.from_city || ''}
                    readOnly
                  />
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Telefon</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromPhone}
                      onChange={(e) => handleChange('fromPhone', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_phone || ''}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">E-Mail</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.fromEmail}
                      onChange={(e) => handleChange('fromEmail', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.from_email || ''}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
                {editMode ? (
                  <>
                    <input
                      type="checkbox"
                      id="fromElevator"
                      checked={formData.fromElevator}
                      onChange={(e) => handleChange('fromElevator', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-brand-primary"
                    />
                    <Label htmlFor="fromElevator" className="text-slate-700 cursor-pointer">
                      Lift vorhanden
                    </Label>
                  </>
                ) : (
                  <span className="text-slate-700">
                    Lift vorhanden: {offer.from_elevator ? 'Ja' : 'Nein'}
                  </span>
                )}
              </div>

              <div>
                <Label className="text-slate-700">Etage *</Label>
                {editMode ? (
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.fromFloor}
                    onChange={(e) => handleChange('fromFloor', parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.from_floor || 0}
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Neuer Standort */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Neuer Standort</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-slate-700">Strasse</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.toStreet}
                      onChange={(e) => handleChange('toStreet', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.to_street || ''}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">PLZ</Label>
                  {editMode ? (
                    <Input
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.toZip}
                      onChange={(e) => handleChange('toZip', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.to_zip || ''}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Ort</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toCity}
                    onChange={(e) => handleChange('toCity', e.target.value)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.to_city || ''}
                    readOnly
                  />
                )}
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
                {editMode ? (
                  <>
                    <input
                      type="checkbox"
                      id="toElevator"
                      checked={formData.toElevator}
                      onChange={(e) => handleChange('toElevator', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-brand-primary"
                    />
                    <Label htmlFor="toElevator" className="text-slate-700 cursor-pointer">
                      Lift vorhanden
                    </Label>
                  </>
                ) : (
                  <span className="text-slate-700">
                    Lift vorhanden: {offer.to_elevator ? 'Ja' : 'Nein'}
                  </span>
                )}
              </div>

              <div>
                <Label className="text-slate-700">Etage *</Label>
                {editMode ? (
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.toFloor}
                    onChange={(e) => handleChange('toFloor', parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.to_floor || 0}
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Umzugsdetails */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Umzugsdetails</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Umzugstermin</Label>
                  {editMode ? (
                    <Input
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.movingDate}
                      onChange={(e) => handleChange('movingDate', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={formatDate(offer.moving_date)}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Arbeitsbeginn</Label>
                  {editMode ? (
                    <Input
                      type="time"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={formatTime(offer.start_time)}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Reinigungstermin</Label>
                  {editMode ? (
                    <Input
                      type="date"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.cleaningDate}
                      onChange={(e) => handleChange('cleaningDate', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.cleaning_date ? formatDate(offer.cleaning_date) : 'N/A'}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Reinigung Arbeitsbeginn</Label>
                  {editMode ? (
                    <Input
                      type="time"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.cleaningStartTime}
                      onChange={(e) => handleChange('cleaningStartTime', e.target.value)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.cleaning_start_time ? formatTime(offer.cleaning_start_time) : 'N/A'}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Objekttyp *</Label>
                {editMode ? (
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
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.object_type || 'Wohnung'}
                    readOnly
                  />
                )}
              </div>

              <div>
                <Label className="text-slate-700">Anzahl Zimmer *</Label>
                {editMode ? (
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
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.room_count || 3}
                    readOnly
                  />
                )}
                {editMode && <p className="text-xs text-slate-600 mt-1">Zwischen 1 und 10 Zimmer</p>}
              </div>

              <div>
                <Label className="text-slate-700">Zusätzliche Objektbeschreibung (optional)</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.object}
                    onChange={(e) => handleChange('object', e.target.value)}
                    placeholder='z.B. "Mit Balkon, Einbauküche, etc."'
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.object_description || 'N/A'}
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Umzugsleistungen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Umzugsleistungen</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Umzugswagen (Anzahl)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      min="0"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.trucks}
                      onChange={(e) => handleChange('trucks', parseInt(e.target.value) || 0)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.trucks || 0}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <Label className="text-slate-700">Umzugsmitarbeiter (Anzahl)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      min="0"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.workers}
                      onChange={(e) => handleChange('workers', parseInt(e.target.value) || 0)}
                    />
                  ) : (
                    <Input
                      className="bg-slate-50 border-slate-200 text-slate-600"
                      value={offer.workers || 0}
                      readOnly
                    />
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                  {editMode ? (
                    <>
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
                    </>
                  ) : (
                    <span className="text-slate-700">
                      Anhänger: {offer.has_trailer ? 'Ja' : 'Nein'}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50">
                  {editMode ? (
                    <>
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
                    </>
                  ) : (
                    <span className="text-slate-700">
                      Sprinter: {offer.has_sprinter ? 'Ja' : 'Nein'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Umzugskisten</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.boxesNote}
                    onChange={(e) => handleChange('boxesNote', e.target.value)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.boxes_note || 'N/A'}
                    readOnly
                  />
                )}
              </div>

              <div>
                <Label className="text-slate-700">De/Montage</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.assemblyNote}
                    onChange={(e) => handleChange('assemblyNote', e.target.value)}
                  />
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={offer.assembly_note || 'N/A'}
                    readOnly
                  />
                )}
              </div>

              <div>
                <Label className="text-slate-700">Pauschalpreis Umzug (CHF)</Label>
                {editMode ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary flex-1"
                      value={formData.flatRatePrice}
                      onChange={(e) => handleChange('flatRatePrice', parseFloat(e.target.value) || 0)}
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
                ) : (
                  <Input
                    className="bg-slate-50 border-slate-200 text-slate-600"
                    value={formatCurrency(offer.flat_rate_price || 0)}
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Zusatzleistungen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Zusatzleistungen</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              {additionalServices.map((service) => {
                // Map service names to correct form field names
                const fieldNameMap = {
                  'Reinigung': 'extraCleaning',
                  'Entsorgung': 'extraDisposal',
                  'Verpackungsservice': 'extraPacking'
                }
                const fieldName = fieldNameMap[service.name] || `extra${service.name.replace(/\s+/g, '')}`
                
                return (
                  <div key={service.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Label className="text-slate-700">{service.name}</Label>
                        {service.price && (
                          <span className="text-sm font-semibold text-brand-primary">
                            CHF {Number(service.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                      )}
                    </div>
                    {editMode ? (
                      <input
                        type="checkbox"
                        checked={formData[fieldName] || false}
                        onChange={(e) => handleChange(fieldName, e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-brand-primary"
                      />
                    ) : (
                      <span className="text-slate-700">{formData[fieldName] ? 'Ja' : 'Nein'}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notizen */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Notizen</h2>
            </div>
            <div className="px-6 py-5">
              {editMode ? (
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Zusätzliche Notizen..."
                />
              ) : (
                <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg min-h-[100px]">
                  {offer.notes || 'Keine Notizen'}
                </div>
              )}
            </div>
          </div>

          {/* Preiskalkulation */}
          <div className="bg-white rounded-lg border-2 border-brand-primary/20">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Preiskalkulation</h2>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-3 text-slate-700">
                <div className="flex justify-between text-base">
                  <span>Pauschalpreis Umzug:</span>
                  <span className="font-mono">{formatCurrency(editMode ? (formData.flatRatePrice || 0) : (offer.flat_rate_price || 0))}</span>
                </div>
                {calculateAdditionalServicesTotal() > 0 && (
                  <>
                    {getSelectedAdditionalServices().map((service) => {
                      const isStundensatz = service.name === 'Stundensatz' || service.name.toLowerCase().includes('stundensatz')
                      const hasBreakdown = isStundensatz && service.base_price && service.price !== service.base_price
                      
                      return (
                        <div key={service.id} className="flex justify-between text-base">
                          <span>
                            {service.name}:
                            {hasBreakdown && (
                              <span className="ml-2 text-xs text-slate-600">
                                (Basis: {formatCurrency(service.base_price)} + {formatCurrency(service.price - service.base_price)})
                              </span>
                            )}
                          </span>
                          <span className="font-mono">{formatCurrency(Number(service.price))}</span>
                        </div>
                      )
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
                    <span className="font-mono">{formatCurrency(editMode ? (formData.flatRatePrice || 0) : (offer.flat_rate_price || 0))}</span>
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
        </div>
      </div>

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-black mb-4">Offerte per E-Mail senden</h3>
            <div className="mb-4">
              <Label className="text-black font-medium mb-2 block">E-Mail-Adresse des Empfängers</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="kunde@beispiel.ch"
                className="mt-2 text-black bg-white border-slate-300"
              />
              <p className="text-sm text-slate-700 mt-2">
                Die Offerte wird mit einem Link zum Ansehen, Unterschreiben und Akzeptieren per E-Mail versendet.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowEmailDialog(false)
                  setRecipientEmail('')
                }}
                variant="outline"
                disabled={sendingEmail}
                className="border-slate-300 bg-white text-black hover:bg-slate-100"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                {sendingEmail ? 'Wird gesendet...' : 'E-Mail senden'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfferDetail
