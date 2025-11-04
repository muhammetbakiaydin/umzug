import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getOffer, updateOffer, getServiceCategories, getAllAdditionalServices } from '@/lib/supabase'
import { ArrowLeft, Save, FileDown, Edit, X, Mail } from 'lucide-react'
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

  useEffect(() => {
    loadOffer()
    loadServices()
    loadAdditionalServices()
  }, [id])

  const loadServices = async () => {
    const { data: cats } = await getServiceCategories()
    if (cats) setServices(cats)
  }

  const loadAdditionalServices = async () => {
    const { data: addServices } = await getAllAdditionalServices()
    if (addServices) setAdditionalServices(addServices.filter(s => s.active))
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
      serviceCategory: data.category || 'umzug',
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
      
      toStreet: data.to_street || '',
      toZip: data.to_zip || '',
      toCity: data.to_city || '',
      toElevator: data.to_elevator || false,
      
      movingDate: data.moving_date || '',
      startTime: data.start_time || '',
      cleaningDate: data.cleaning_date || '',
      cleaningStartTime: data.cleaning_start_time || '',
      object: data.object_description || '',
      
      trucks: data.trucks || 1,
      workers: data.workers || 2,
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
        category: formData.serviceCategory,
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
        
        to_street: formData.toStreet,
        to_zip: formData.toZip,
        to_city: formData.toCity,
        to_elevator: formData.toElevator,
        
        moving_date: formData.movingDate,
        start_time: formData.startTime,
        cleaning_date: formData.cleaningDate || null,
        cleaning_start_time: formData.cleaningStartTime || null,
        object_description: formData.object,
        
        trucks: formData.trucks,
        workers: formData.workers,
        boxes_note: formData.boxesNote,
        assembly_note: formData.assemblyNote,
        flat_rate_price: formData.flatRatePrice,
        
        extra_cleaning: formData.extraCleaning,
        extra_disposal: formData.extraDisposal,
        extra_packing: formData.extraPacking,
        
        subtotal: formData.flatRatePrice,
        tax_rate: 7.7,
        tax_amount: (formData.flatRatePrice * 7.7) / 100,
        total: formData.flatRatePrice + (formData.flatRatePrice * 7.7) / 100,
        
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

  const exportPDF = () => {
    if (!offer) return
    
    // Set document title for PDF filename
    document.title = `Offerte_${offer.offer_number}`
    
    // Open the print route in a new window
    const printWindow = window.open(`/admin/offers/${id}/print`, '_blank')
    
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
      await sendOfferEmail(offer, recipientEmail)
      toast.success(`Offerte erfolgreich an ${recipientEmail} gesendet!`)
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
            <div className="flex gap-2">
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
                  <Label className="text-slate-700">Service-Kategorie</Label>
                  {editMode ? (
                    <>
                      <select
                        className="w-full h-10 rounded-md border border-slate-200 bg-white text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                        value={formData.serviceCategory}
                        onChange={(e) => handleChange('serviceCategory', e.target.value)}
                      >
                        {services.map(service => (
                          <option key={service.id} value={service.value}>
                            {service.name}
                            {service.pricing_model === 'hourly' && service.hourly_rate 
                              ? ` - CHF ${Number(service.hourly_rate).toFixed(2)}/Std`
                              : service.pricing_model === 'fixed' && service.base_price
                              ? ` - CHF ${Number(service.base_price).toFixed(2)}`
                              : ''}
                          </option>
                        ))}
                      </select>
                      {(() => {
                        const selectedService = services.find(s => s.value === formData.serviceCategory)
                        if (selectedService && selectedService.description) {
                          return (
                            <p className="text-xs text-slate-600 mt-1.5">{selectedService.description}</p>
                          )
                        }
                        return null
                      })()}
                    </>
                  ) : (
                    <>
                      <Input
                        className="bg-slate-50 border-slate-200 text-slate-600"
                        value={offer.category}
                        readOnly
                      />
                      {(() => {
                        const selectedService = services.find(s => s.value === offer.category)
                        if (selectedService) {
                          let priceInfo = ''
                          if (selectedService.pricing_model === 'hourly' && selectedService.hourly_rate) {
                            priceInfo = `CHF ${Number(selectedService.hourly_rate).toFixed(2)}/Std`
                          } else if (selectedService.pricing_model === 'fixed' && selectedService.base_price) {
                            priceInfo = `CHF ${Number(selectedService.base_price).toFixed(2)}`
                          }
                          if (priceInfo || selectedService.description) {
                            return (
                              <div className="mt-1.5 space-y-1">
                                {priceInfo && (
                                  <p className="text-xs font-semibold text-brand-primary">{priceInfo}</p>
                                )}
                                {selectedService.description && (
                                  <p className="text-xs text-slate-600">{selectedService.description}</p>
                                )}
                              </div>
                            )
                          }
                        }
                        return null
                      })()}
                    </>
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
                <Label className="text-slate-700">Objekt</Label>
                {editMode ? (
                  <Input
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.object}
                    onChange={(e) => handleChange('object', e.target.value)}
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
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    value={formData.flatRatePrice}
                    onChange={(e) => handleChange('flatRatePrice', parseFloat(e.target.value) || 0)}
                  />
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
                const fieldName = `extra${service.name.replace(/\s+/g, '')}`
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
                      <span className="text-slate-700">{(formData[fieldName] || offer[`extra_${service.name.toLowerCase().replace(/\s+/g, '_')}`]) ? 'Ja' : 'Nein'}</span>
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
                <div className="flex justify-between text-lg">
                  <span>Zwischensumme:</span>
                  <span className="font-mono">{formatCurrency(editMode ? formData.flatRatePrice : offer.flat_rate_price || 0)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>MwSt. (7.7%):</span>
                  <span className="font-mono">{formatCurrency((editMode ? formData.flatRatePrice : offer.flat_rate_price || 0) * 7.7 / 100)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-slate-900 border-t border-slate-200 pt-3">
                  <span>Total:</span>
                  <span className="font-mono text-brand-primary">
                    {formatCurrency((editMode ? formData.flatRatePrice : offer.flat_rate_price || 0) * 1.077)}
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
            <h3 className="text-xl font-bold text-slate-900 mb-4">Offerte per E-Mail senden</h3>
            <div className="mb-4">
              <Label className="text-slate-900 font-medium mb-2">E-Mail-Adresse des Empfängers</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="kunde@beispiel.ch"
                className="mt-2 text-black"
              />
              <p className="text-sm text-slate-600 mt-2">
                Die Offerte wird als PDF-Link per E-Mail versendet.
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
                className="border-slate-300 text-black hover:bg-slate-100"
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
