import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [companySettings, setCompanySettings] = useState({ vat_rate: 7.7 })
  const [editingVat, setEditingVat] = useState(false)
  const [vatRate, setVatRate] = useState(7.7)
  
  // Service Categories
  const [serviceCategories, setServiceCategories] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', value: '', active: true })
  const [showAddCategory, setShowAddCategory] = useState(false)
  
  // Additional Services
  const [additionalServices, setAdditionalServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [newService, setNewService] = useState({ name: '', description: '', active: true })
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
      setNewCategory({ name: '', value: '', active: true })
      setShowAddCategory(false)
    }
  }

  const handleUpdateCategory = async (id, updates) => {
    const { error } = await updateServiceCategory(id, updates)
    
    if (error) {
      toast.error('Fehler beim Aktualisieren der Kategorie')
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
    
    const { error } = await createAdditionalService({
      ...newService,
      display_order: additionalServices.length
    })
    
    if (error) {
      toast.error('Fehler beim Erstellen der Zusatzleistung')
    } else {
      toast.success('Zusatzleistung erfolgreich erstellt')
      loadSettings()
      setNewService({ name: '', description: '', active: true })
      setShowAddService(false)
    }
  }

  const handleUpdateService = async (id, updates) => {
    const { error } = await updateAdditionalService(id, updates)
    
    if (error) {
      toast.error('Fehler beim Aktualisieren der Zusatzleistung')
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-slate-700 hover:text-brand-secondary hover:bg-slate-100"
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold text-brand-secondary">Einstellungen</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-slate-600 hover:text-slate-900'
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
                  : 'text-slate-600 hover:text-slate-900'
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
                  : 'text-slate-600 hover:text-slate-900'
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
                <h3 className="font-medium text-slate-900 mb-4">Neue Kategorie hinzufügen</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-700">Name</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="z.B. Umzug"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">Wert (für System)</Label>
                    <Input
                      value={newCategory.value}
                      onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
                      placeholder="z.B. umzug"
                      className="bg-white"
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
                        setNewCategory({ name: '', value: '', active: true })
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
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 grid md:grid-cols-3 gap-4 mr-4">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="bg-white"
                      />
                      <Input
                        value={editingCategory.value}
                        onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                        className="bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleUpdateCategory(category.id, editingCategory)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setEditingCategory(null)} size="sm" variant="outline">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{category.name}</div>
                        <div className="text-sm text-slate-600">Wert: {category.value}</div>
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
                          onClick={() => setEditingCategory(category)}
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
                    </>
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
                <h3 className="font-medium text-slate-900 mb-4">Neue Zusatzleistung hinzufügen</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700">Name</Label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="z.B. Reinigung"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700">Beschreibung (optional)</Label>
                    <Input
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="z.B. Endreinigung der Wohnung"
                      className="bg-white"
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
                      setNewService({ name: '', description: '', active: true })
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
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  {editingService?.id === service.id ? (
                    <div className="flex-1 grid md:grid-cols-2 gap-4 mr-4">
                      <Input
                        value={editingService.name}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="bg-white"
                      />
                      <Input
                        value={editingService.description || ''}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleUpdateService(service.id, editingService)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setEditingService(null)} size="sm" variant="outline">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-slate-600">{service.description}</div>
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
                          onClick={() => setEditingService(service)}
                          size="sm"
                          className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleUpdateService(service.id, { active: !service.active })}
                          size="sm"
                          className={`bg-white border border-slate-200 ${service.active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                        >
                          {service.active ? 'Deaktivieren' : 'Aktivieren'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteService(service.id)}
                          size="sm"
                          className="bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
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
                <Label className="text-slate-700">MwSt. Satz (%)</Label>
                {editingVat ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="bg-white"
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
                      <div className="text-2xl font-bold text-slate-900">{companySettings.vat_rate}%</div>
                      <div className="text-sm text-slate-600">Aktueller MwSt. Satz</div>
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
