import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Package, CheckSquare, Percent } from 'lucide-react'
import { toast } from 'sonner'
import {
  getCompanySettings,
  updateCompanySettings,
  getAllServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getAllAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService
} from '@/lib/supabase'

const SettingsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')
  
  // Company Settings
  const [companySettings, setCompanySettings] = useState({ vat_rate: 8.1 })
  const [editingVat, setEditingVat] = useState(false)
  const [vatRate, setVatRate] = useState(8.1)
  
  // PDF Terms/Policy Sections
  const [editingTerms, setEditingTerms] = useState(false)
  const [pdfTerms, setPdfTerms] = useState({
    insurance_title: 'Versicherungen',
    insurance_text: 'Die Transportversicherung ist im Preis inbegriffen mit einem Deckungsumfang von CHF 40\'000.00. Weiter haftet unsere Betriebshaftpflichtversicherung bei Schäden bis zu CHF 100\'000.- Bestehende Schäden am Mobiliar sind dem Umzugschef vor dem Umzug mitzuteilen.',
    preparation_title: 'Vorbereitung',
    preparation_text: 'Das Verpacken von kleineren Gegenständen wird durch den Kunden in Kartonschachteln bereitgestellt. Grösseres Umzugsgut wie TV und Sofa wird durch die Firma Umzug UNIT GmbH verpackt.',
    materials_title: 'Verbrauchsmaterial',
    materials_text: 'Umzugsdecken werden vor Ort gratis zur Verfügung gestellt, damit das Umzugsgut gut gesichert wird. Verbrauchsmaterial wie Folien oder Bodenfliesen werden verrechnet, sowie das Depot für die Umzugskisten.',
    breaks_title: 'Pausen',
    breaks_text: 'Vor- und Nachmittag: 15 Minuten\nMittagspause: 30 Minuten',
    information_title: 'Information',
    information_text: 'Die Offerte setzt voraus, dass beide Standorte frei zugänglich und über das schweizer Strassennetz erreichbar sind. Ist der Lieferwert mit normalen Umzugswagen nicht oder nur erschwert zugänglich, so erfolgt die Lieferung bis zur nächsten allgemein zugänglichen Stelle die ohne Zusatzaufwand oder Zusatzkosten erreicht werden kann.',
    damages_title: 'Schäden',
    damages_text: 'Schäden müssen gemäss OR Art.452 Absatz 1 sofort nach dem Umzug am Umzugsladearbeiter mitgeteilt und schriftlich auf dem Schadenmeldungsformular mit dem Unterschrift des Kunden und des Umzugschefs festgehalten werden.',
    payment_title: 'Zahlungsbedingungen',
    payment_text: 'Barzahlung am Abladeort nach dem Umzug an den Teamleiter. Dies betrifft den Betrag für den gesammten Umzug und Reinigung.'
  })
  
  // Service Categories
  const [serviceCategories, setServiceCategories] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    value: '', 
    description: '',
    base_price: 0,
    active: true 
  })
  const [showAddCategory, setShowAddCategory] = useState(false)
  
  // Additional Services
  const [additionalServices, setAdditionalServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [newService, setNewService] = useState({ name: '', description: '', price: '', active: true })
  const [showAddService, setShowAddService] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    
    // Load company settings
    const { data: settings } = await getCompanySettings()
    if (settings) {
      setCompanySettings(settings)
      setVatRate(settings.vat_rate || 7.7)
      
      // Load PDF terms if they exist
      if (settings.insurance_title) {
        setPdfTerms({
          insurance_title: settings.insurance_title || 'Versicherungen',
          insurance_text: settings.insurance_text || '',
          preparation_title: settings.preparation_title || 'Vorbereitung',
          preparation_text: settings.preparation_text || '',
          materials_title: settings.materials_title || 'Verbrauchsmaterial',
          materials_text: settings.materials_text || '',
          breaks_title: settings.breaks_title || 'Pausen',
          breaks_text: settings.breaks_text || '',
          information_title: settings.information_title || 'Information',
          information_text: settings.information_text || '',
          damages_title: settings.damages_title || 'Schäden',
          damages_text: settings.damages_text || '',
          payment_title: settings.payment_title || 'Zahlungsbedingungen',
          payment_text: settings.payment_text || ''
        })
      }
    }
    
    // Load service categories
    const { data: categories } = await getAllServiceCategories()
    if (categories) setServiceCategories(categories)
    
    // Load additional services
    const { data: services } = await getAllAdditionalServices()
    if (services) setAdditionalServices(services)
    
    setLoading(false)
  }

  // VAT Rate Management
  const handleSaveVat = async () => {
    const { error } = await updateCompanySettings({
      id: companySettings.id,
      vat_rate: parseFloat(vatRate),
      vat_enabled: companySettings.vat_enabled
    })
    
    if (error) {
      toast.error('Fehler beim Speichern der MwSt.')
    } else {
      toast.success('MwSt. erfolgreich aktualisiert')
      setCompanySettings({ ...companySettings, vat_rate: parseFloat(vatRate) })
      setEditingVat(false)
    }
  }

  const handleToggleVat = async () => {
    const newStatus = !companySettings.vat_enabled
    const { error } = await updateCompanySettings({
      id: companySettings.id,
      vat_enabled: newStatus
    })
    
    if (error) {
      toast.error('Fehler beim Aktualisieren des Status')
    } else {
      toast.success(newStatus ? 'MwSt. aktiviert' : 'MwSt. deaktiviert')
      setCompanySettings({ ...companySettings, vat_enabled: newStatus })
    }
  }

  // PDF Terms Management
  const handleSaveTerms = async () => {
    const { error } = await updateCompanySettings({
      id: companySettings.id,
      ...pdfTerms
    })
    
    if (error) {
      toast.error('Fehler beim Speichern der PDF-Bedingungen')
    } else {
      toast.success('PDF-Bedingungen erfolgreich aktualisiert')
      setCompanySettings({ ...companySettings, ...pdfTerms })
      setEditingTerms(false)
    }
  }

  // Service Category Management
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.value) {
      toast.error('Bitte alle Felder ausfüllen')
      return
    }
    
    const { error } = await createServiceCategory({
      ...newCategory,
      display_order: serviceCategories.length
    })
    
    if (error) {
      toast.error('Fehler beim Erstellen der Kategorie')
    } else {
      toast.success('Kategorie erfolgreich erstellt')
      loadSettings()
      setNewCategory({ 
        name: '', 
        value: '', 
        description: '',
        base_price: 0,
        active: true 
      })
      setShowAddCategory(false)
    }
  }

  const openEditModal = (category) => {
    setEditingCategory({
      ...category,
      description: category.description || '',
      base_price: category.base_price || 0
    })
  }

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory.name) {
      toast.error('Bitte einen Namen eingeben')
      return
    }
    
    const { error } = await updateServiceCategory(editingCategory.id, {
      name: editingCategory.name,
      value: editingCategory.value,
      description: editingCategory.description,
      base_price: parseFloat(editingCategory.base_price),
      active: editingCategory.active
    })
    
    if (error) {
      console.error('Update category error:', error)
      toast.error(`Fehler beim Aktualisieren der Kategorie: ${error.message}`)
    } else {
      toast.success('Kategorie erfolgreich aktualisiert')
      loadSettings()
      setEditingCategory(null)
    }
  }

  const handleUpdateCategory = async (id, updates) => {
    const { error } = await updateServiceCategory(id, updates)
    
    if (error) {
      console.error('Update category error:', error)
      toast.error(`Fehler beim Aktualisieren der Kategorie: ${error.message}`)
    } else {
      toast.success('Kategorie erfolgreich aktualisiert')
      loadSettings()
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) return
    
    const { error } = await deleteServiceCategory(id)
    
    if (error) {
      toast.error('Fehler beim Löschen der Kategorie')
    } else {
      toast.success('Kategorie erfolgreich gelöscht')
      loadSettings()
    }
  }

  // Additional Service Management
  const handleAddService = async () => {
    if (!newService.name) {
      toast.error('Bitte einen Namen eingeben')
      return
    }
    
    const serviceData = {
      ...newService,
      price: newService.price ? parseFloat(newService.price) : 0,
      display_order: additionalServices.length
    }
    
    console.log('Creating service with data:', serviceData)
    
    const { error } = await createAdditionalService(serviceData)
    
    if (error) {
      console.error('Create service error:', error)
      toast.error(`Fehler beim Erstellen der Zusatzleistung: ${error.message}`)
    } else {
      toast.success('Zusatzleistung erfolgreich erstellt')
      loadSettings()
      setNewService({ name: '', description: '', price: '', active: true })
      setShowAddService(false)
    }
  }

  const handleUpdateService = async (id, updates) => {
    // Convert price to float if it exists
    const updateData = {
      ...updates,
      price: updates.price ? parseFloat(updates.price) : 0
    }
    
    console.log('Updating service with data:', updateData)
    
    const { error } = await updateAdditionalService(id, updateData)
    
    if (error) {
      console.error('Update service error:', error)
      toast.error(`Fehler beim Aktualisieren der Zusatzleistung: ${error.message}`)
    } else {
      toast.success('Zusatzleistung erfolgreich aktualisiert')
      loadSettings()
      setEditingService(null)
    }
  }

  const handleDeleteService = async (id) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Zusatzleistung löschen möchten?')) return
    
    const { error } = await deleteAdditionalService(id)
    
    if (error) {
      toast.error('Fehler beim Löschen der Zusatzleistung')
    } else {
      toast.success('Zusatzleistung erfolgreich gelöscht')
      loadSettings()
    }
  }

  if (loading) {
    return <div className="p-8">Lädt...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-black hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('services')}
            >
              <Package className="h-4 w-4" />
              Service-Kategorien
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'additional'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-black hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('additional')}
            >
              <CheckSquare className="h-4 w-4" />
              Zusatzleistungen
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'vat'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-black hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('vat')}
            >
              <Percent className="h-4 w-4" />
              MwSt. Satz
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'pdf-terms'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-black hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('pdf-terms')}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF-Bedingungen
            </button>
          </div>
        </div>

        {/* Service Categories Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Service-Kategorien verwalten</h2>
              <Button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Kategorie
              </Button>
            </div>

            {/* Add Category Form */}
            {showAddCategory && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-medium text-black mb-4">Neue Kategorie hinzufügen</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-black">Name</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="z.B. Umzug"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-black">Wert (für System)</Label>
                    <Input
                      value={newCategory.value}
                      onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                      placeholder="z.B. umzug"
                      className="bg-white text-black"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Speichern
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddCategory(false)
                        setNewCategory({ 
                          name: '', 
                          value: '', 
                          description: '',
                          base_price: 0,
                          active: true 
                        })
                      }}
                      variant="outline"
                      className="border-slate-300 text-black hover:bg-slate-100"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-3">
              {serviceCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="font-medium text-black">{category.name}</div>
                      <div className="text-sm text-black">Wert: {category.value}</div>
                      {category.description && (
                        <div className="text-xs text-black mt-1">{category.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          category.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {category.active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <Button
                        onClick={() => {
                          if (editingCategory?.id === category.id) {
                            setEditingCategory(null)
                          } else {
                            openEditModal(category)
                          }
                        }}
                        size="sm"
                        className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleUpdateCategory(category.id, { active: !category.active })}
                        size="sm"
                        className={`bg-white border border-slate-200 ${category.active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {category.active ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        size="sm"
                        className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Edit Form */}
                  {editingCategory?.id === category.id && (
                    <div className="border-t border-slate-200 p-6 bg-white">
                      <h3 className="font-semibold text-black mb-4">Kategorie bearbeiten</h3>
                      
                      <div className="space-y-4">
                        {/* Category Name */}
                        <div>
                          <Label className="text-black font-medium">Kategorie-Name *</Label>
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            placeholder="z.B. Umzug"
                            className="bg-white border-slate-300 mt-1 text-black"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label className="text-black font-medium">Beschreibung (Deutsch)</Label>
                          <Input
                            value={editingCategory.description || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            placeholder="z.B. Professioneller Umzugsservice"
                            className="bg-white border-slate-300 mt-1 text-black"
                          />
                        </div>

                        {/* Base Price */}
                        <div>
                          <Label className="text-black font-medium">Basispreis (CHF)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editingCategory.base_price || 0}
                            onChange={(e) => setEditingCategory({ ...editingCategory, base_price: e.target.value })}
                            placeholder="0"
                            className="bg-white border-slate-300 mt-1 text-black"
                          />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <Label className="text-black font-medium">Aktiv</Label>
                            <p className="text-xs text-black mt-0.5">Kategorie für neue Angebote verfügbar machen</p>
                          </div>
                          <Switch
                            checked={editingCategory.active}
                            onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, active: checked })}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={handleSaveCategoryEdit}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Änderungen speichern
                          </Button>
                          <Button
                            onClick={() => setEditingCategory(null)}
                            variant="outline"
                            className="border-slate-300 bg-white text-black hover:bg-slate-100"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Services Tab */}
        {activeTab === 'additional' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Zusatzleistungen verwalten</h2>
              <Button
                onClick={() => setShowAddService(!showAddService)}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Neue Zusatzleistung
              </Button>
            </div>

            {/* Add Service Form */}
            {showAddService && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-medium text-black mb-4">Neue Zusatzleistung hinzufügen</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-black">Name</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="z.B. Reinigung"
                      className="bg-white text-black"
                    />
                  </div>
                  <div>
                    <Label className="text-black">Preis (CHF)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="z.B. 150.00"
                      className="bg-white text-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-black">Beschreibung (optional)</Label>
                    <Input
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="z.B. Endreinigung der Wohnung"
                      className="bg-white text-black"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddService} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddService(false)
                      setNewService({ name: '', description: '', price: '', active: true })
                    }}
                    variant="outline"
                    className="border-slate-300 text-black hover:bg-slate-100"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}

            {/* Services List */}
            <div className="space-y-3">
              {additionalServices.map((service) => (
                <div key={service.id} className="bg-slate-50 rounded-lg border border-slate-200">
                  {/* Service Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-black">{service.name}</div>
                        <div className="text-sm font-semibold text-brand-primary">
                          CHF {service.price ? Number(service.price).toFixed(2) : '0.00'}
                        </div>
                      </div>
                      {service.description && (
                        <div className="text-sm text-black">{service.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          service.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {service.active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <Button
                        onClick={() => setEditingService(editingService?.id === service.id ? null : service)}
                        size="sm"
                        className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteService(service.id)}
                        size="sm"
                        className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Edit Form */}
                  {editingService?.id === service.id && (
                    <div className="border-t border-slate-200 p-4 bg-white">
                      <h4 className="font-medium text-black mb-4">Zusatzleistung bearbeiten</h4>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-black text-sm font-medium">Leistungsname *</Label>
                            <Input
                              value={editingService.name}
                              onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                              placeholder="z.B. Reinigung"
                              className="bg-white mt-1.5 text-black"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-black text-sm font-medium">Preis (CHF) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingService.price || ''}
                              onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                              placeholder="z.B. 150.00"
                              className="bg-white mt-1.5 text-black"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-black text-sm font-medium">Beschreibung (optional)</Label>
                          <textarea
                            value={editingService.description || ''}
                            onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                            placeholder="Detaillierte Beschreibung der Zusatzleistung..."
                            className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none text-black"
                            rows="3"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <Label className="text-black font-medium">Status</Label>
                            <p className="text-sm text-black">
                              Leistung für Angebote {editingService.active ? 'verfügbar' : 'nicht verfügbar'}
                            </p>
                          </div>
                          <Switch
                            checked={editingService.active}
                            onCheckedChange={(checked) => setEditingService({ ...editingService, active: checked })}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleUpdateService(service.id, editingService)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Änderungen speichern
                          </Button>
                          <Button
                            onClick={() => setEditingService(null)}
                            variant="outline"
                            className="bg-white border-slate-300 text-black hover:bg-slate-100"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VAT Rate Tab */}
        {activeTab === 'vat' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Mehrwertsteuersatz verwalten</h2>
            
            <div className="max-w-md">
              {/* Active/Inactive Toggle */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-black font-medium">MwSt. Status</Label>
                    <p className="text-sm text-slate-700 mt-1">
                      {companySettings.vat_enabled 
                        ? 'MwSt. wird in Angeboten angezeigt' 
                        : 'MwSt. wird in Angeboten ausgeblendet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      companySettings.vat_enabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {companySettings.vat_enabled ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <Switch
                      checked={companySettings.vat_enabled}
                      onCheckedChange={handleToggleVat}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-black">MwSt. Satz (%)</Label>
                {editingVat ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="bg-white text-black"
                    />
                    <Button onClick={handleSaveVat} className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Speichern
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingVat(false)
                        setVatRate(companySettings.vat_rate)
                      }}
                      variant="outline"
                      className="border-slate-300 text-black hover:bg-slate-100"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Abbrechen
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                    <div>
                      <div className="text-2xl font-bold text-black">{companySettings.vat_rate}%</div>
                      <div className="text-sm text-black">Aktueller MwSt. Satz</div>
                    </div>
                    <Button
                      onClick={() => setEditingVat(true)}
                      className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Dieser Satz wird bei allen neuen Angeboten automatisch verwendet. 
                  Bestehende Angebote werden nicht geändert.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Terms Tab */}
        {activeTab === 'pdf-terms' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">PDF-Bedingungen verwalten</h2>
                <p className="text-sm text-slate-600 mt-1">Bearbeiten Sie die Texte, die im PDF-Angebot angezeigt werden</p>
              </div>
              {!editingTerms ? (
                <Button
                  onClick={() => setEditingTerms(true)}
                  className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSaveTerms} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingTerms(false)
                      loadSettings()
                    }}
                    variant="outline"
                    className="border-slate-300 text-black hover:bg-slate-100"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Abbrechen
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Versicherungen */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Versicherungen</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.insurance_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, insurance_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.insurance_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, insurance_text: e.target.value})}
                        rows={4}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.insurance_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.insurance_text}</div>
                  </div>
                )}
              </div>

              {/* Vorbereitung */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Vorbereitung</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.preparation_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, preparation_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.preparation_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, preparation_text: e.target.value})}
                        rows={3}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.preparation_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.preparation_text}</div>
                  </div>
                )}
              </div>

              {/* Verbrauchsmaterial */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Verbrauchsmaterial</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.materials_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, materials_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.materials_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, materials_text: e.target.value})}
                        rows={3}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.materials_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.materials_text}</div>
                  </div>
                )}
              </div>

              {/* Pausen */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Pausen</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.breaks_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, breaks_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.breaks_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, breaks_text: e.target.value})}
                        rows={2}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.breaks_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.breaks_text}</div>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Information</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.information_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, information_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.information_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, information_text: e.target.value})}
                        rows={4}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.information_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.information_text}</div>
                  </div>
                )}
              </div>

              {/* Schäden */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Schäden</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.damages_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, damages_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.damages_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, damages_text: e.target.value})}
                        rows={3}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.damages_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.damages_text}</div>
                  </div>
                )}
              </div>

              {/* Zahlungsbedingungen */}
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-black font-medium">Zahlungsbedingungen</Label>
                {editingTerms ? (
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm text-slate-700">Titel</Label>
                      <Input
                        value={pdfTerms.payment_title}
                        onChange={(e) => setPdfTerms({...pdfTerms, payment_title: e.target.value})}
                        className="bg-white text-black mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-700">Text</Label>
                      <textarea
                        value={pdfTerms.payment_text}
                        onChange={(e) => setPdfTerms({...pdfTerms, payment_text: e.target.value})}
                        rows={2}
                        className="w-full mt-1 rounded-md border border-slate-200 bg-white text-black px-3 py-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div className="font-medium text-black">{pdfTerms.payment_title}</div>
                    <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{pdfTerms.payment_text}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
