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
  
  // Service Categories
  const [serviceCategories, setServiceCategories] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    value: '', 
    description: '',
    pricing_model: 'custom',
    hourly_rate: 120,
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
      vat_rate: parseFloat(vatRate)
    })
    
    if (error) {
      toast.error('Fehler beim Speichern der MwSt.')
    } else {
      toast.success('MwSt. erfolgreich aktualisiert')
      setCompanySettings({ ...companySettings, vat_rate: parseFloat(vatRate) })
      setEditingVat(false)
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
        pricing_model: 'custom',
        hourly_rate: 120,
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
      pricing_model: category.pricing_model || 'custom',
      hourly_rate: category.hourly_rate || 120,
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
      pricing_model: editingCategory.pricing_model,
      hourly_rate: parseFloat(editingCategory.hourly_rate),
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
                          pricing_model: 'custom',
                          hourly_rate: 120,
                          base_price: 0,
                          active: true 
                        })
                      }}
                      variant="outline"
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

                        {/* Pricing Model */}
                        <div>
                          <Label className="text-black font-medium">Preismodell</Label>
                          <select
                            value={editingCategory.pricing_model || 'custom'}
                            onChange={(e) => setEditingCategory({ ...editingCategory, pricing_model: e.target.value })}
                            className="w-full h-10 rounded-md border border-slate-300 bg-white text-black px-3 py-2 mt-1"
                          >
                            <option value="hourly">Stündlich</option>
                            <option value="fixed">Festpreis</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Hourly Rate */}
                          <div>
                            <Label className="text-black font-medium">Stundensatz (CHF)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingCategory.hourly_rate || 0}
                              onChange={(e) => setEditingCategory({ ...editingCategory, hourly_rate: e.target.value })}
                              placeholder="120"
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
                            className="bg-white"
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
      </div>
    </div>
  )
}

export default SettingsPage
