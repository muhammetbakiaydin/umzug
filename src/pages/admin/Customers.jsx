import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers, getOffers } from '@/lib/supabase'
import { generateCustomerNumber } from '@/lib/utils'
import { ArrowLeft, Plus, Edit, Save, X, Search, User, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const CustomersPage = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [customerOfferCount, setCustomerOfferCount] = useState(0)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    customerNumber: '',
    salutation: 'Herr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    setLoading(true)
    const { data, error } = await getCustomers()
    if (error) {
      toast.error('Fehler beim Laden der Kunden')
    } else {
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    }
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      customerNumber: '',
      salutation: 'Herr',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      zip: '',
      city: '',
      notes: '',
    })
    setEditingCustomer(null)
  }

  const openAddModal = () => {
    resetForm()
    setFormData(prev => ({ ...prev, customerNumber: generateCustomerNumber() }))
    setShowModal(true)
  }

  const openEditModal = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      customerNumber: customer.customer_number || '',
      salutation: customer.salutation || 'Herr',
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      street: customer.address_street || '',
      zip: customer.address_zip || '',
      city: customer.address_city || '',
      notes: customer.notes || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const openDeleteModal = async (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
    
    // Check if customer has any offers
    const { data } = await getOffers()
    const customerOffers = data?.filter(offer => offer.customer_id === customer.id) || []
    setCustomerOfferCount(customerOffers.length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const customerData = {
        customer_number: formData.customerNumber,
        salutation: formData.salutation,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address_street: formData.street,
        address_zip: formData.zip,
        address_city: formData.city,
        notes: formData.notes,
      }

      if (editingCustomer) {
        // Update existing customer
        const { error } = await updateCustomer(editingCustomer.id, customerData)
        if (error) {
          toast.error('Fehler beim Aktualisieren: ' + error.message)
        } else {
          toast.success('Kunde erfolgreich aktualisiert!')
          closeModal()
          loadCustomers()
        }
      } else {
        // Create new customer
        const { error } = await createCustomer(customerData)
        if (error) {
          toast.error('Fehler beim Erstellen: ' + error.message)
        } else {
          toast.success('Kunde erfolgreich erstellt!')
          closeModal()
          loadCustomers()
        }
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!customerToDelete) return
    
    setSaving(true)
    try {
      const { error } = await deleteCustomer(customerToDelete.id)
      if (error) {
        // Check if it's a foreign key constraint error
        if (error.message.includes('foreign key constraint') || error.code === '23503') {
          toast.error('Dieser Kunde kann nicht gelöscht werden, da noch Angebote mit diesem Kunden verknüpft sind. Bitte löschen Sie zuerst alle Angebote des Kunden.')
        } else {
          toast.error('Fehler beim Löschen: ' + error.message)
        }
      } else {
        toast.success('Kunde erfolgreich gelöscht!')
        setShowDeleteModal(false)
        setCustomerToDelete(null)
        setCustomerOfferCount(0)
        loadCustomers()
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Kunden</h1>
              <p className="text-slate-600 mt-1">
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Kunde gefunden' : 'Kunden gefunden'}
              </p>
            </div>
            <Button
              onClick={openAddModal}
              className="bg-brand-primary hover:bg-[#d16635] text-white font-semibold px-6"
            >
              <Plus className="mr-2 h-5 w-5" />
              Neuer Kunde
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="bg-white border-slate-200 text-slate-900 pl-12 h-12 text-base"
              placeholder="Suchen nach Kundennummer, Name, E-Mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Customers List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <div className="text-slate-900 text-xl">Lädt...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'Keine Kunden gefunden' : 'Noch keine Kunden vorhanden'}
            </h3>
            {!searchTerm && (
              <Button
                onClick={openAddModal}
                className="mt-6 bg-brand-primary hover:bg-[#d16635] text-white font-semibold px-6"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ersten Kunden erstellen
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Kundennummer</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Telefon</div>
              <div className="col-span-2 text-right">Aktionen</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => openEditModal(customer)}
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {customer.salutation} {customer.first_name} {customer.last_name}
                        </div>
                        {customer.address_city && (
                          <div className="text-xs text-slate-500 truncate">{customer.address_city}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-slate-600 font-mono">{customer.customer_number}</span>
                    </div>
                    
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm text-slate-900 truncate">{customer.email}</span>
                    </div>
                    
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-slate-600">{customer.phone}</span>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(customer)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(customer)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {customer.salutation} {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{customer.email}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{customer.phone}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(customer)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:text-brand-primary hover:bg-brand-primary/10 flex-shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(customer)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-slate-200 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingCustomer ? 'Kunde bearbeiten' : 'Neuer Kunde'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Number */}
                <div>
                  <Label className="text-slate-700 font-medium">Kundennummer *</Label>
                  <Input
                    className="bg-slate-50 border-slate-300 text-slate-500"
                    value={formData.customerNumber}
                    readOnly
                    disabled
                  />
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">Anrede *</Label>
                    <select
                      className="w-full h-10 rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2"
                      value={formData.salutation}
                      onChange={(e) => handleChange('salutation', e.target.value)}
                      required
                    >
                      <option>Herr</option>
                      <option>Frau</option>
                      <option>Divers</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Vorname *</Label>
                    <Input
                      className="bg-white border-slate-300 text-slate-900"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      placeholder="Vorname"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Nachname *</Label>
                    <Input
                      className="bg-white border-slate-300 text-slate-900"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      placeholder="Nachname"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">Email *</Label>
                    <Input
                      type="email"
                      className="bg-white border-slate-300 text-slate-900"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      placeholder="email@beispiel.ch"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Telefon *</Label>
                    <Input
                      type="tel"
                      className="bg-white border-slate-300 text-slate-900"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      placeholder="+41 00 000 00 00"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Adresse (Optional)</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label className="text-slate-700 font-medium">Strasse</Label>
                      <Input
                        className="bg-white border-slate-300 text-slate-900"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        placeholder="Strassenname und Hausnummer"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-700 font-medium">PLZ</Label>
                      <Input
                        className="bg-white border-slate-300 text-slate-900"
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value)}
                        placeholder="z.B. CH-4132"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700 font-medium">Ort</Label>
                    <Input
                      className="bg-white border-slate-300 text-slate-900"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="z.B. Muttenz"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-slate-700 font-medium">Notizen (Optional)</Label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-slate-300 bg-white text-slate-900 px-3 py-2"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Zusätzliche Informationen zum Kunden..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brand-primary hover:bg-[#d16635] text-white font-semibold"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {saving ? 'Speichert...' : (editingCustomer ? 'Aktualisieren' : 'Erstellen')}
                  </Button>
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Abbrechen
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kunde löschen</h2>
                  <p className="text-sm text-slate-600 mt-1">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <p className="text-sm text-slate-700 mb-2">
                  Möchten Sie den folgenden Kunden wirklich löschen?
                </p>
                <p className="font-semibold text-slate-900">
                  {customerToDelete.salutation} {customerToDelete.first_name} {customerToDelete.last_name}
                </p>
                <p className="text-sm text-slate-600">{customerToDelete.email}</p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{customerToDelete.customer_number}</p>
              </div>

              {customerOfferCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Achtung!</h4>
                      <p className="text-sm text-red-700">
                        Dieser Kunde hat <span className="font-semibold">{customerOfferCount}</span> {customerOfferCount === 1 ? 'verknüpftes Angebot' : 'verknüpfte Angebote'}. 
                        Der Kunde kann nicht gelöscht werden, solange Angebote existieren.
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        Bitte löschen Sie zuerst alle Angebote dieses Kunden.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={saving || customerOfferCount > 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  {saving ? 'Löscht...' : 'Ja, löschen'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setCustomerToDelete(null)
                    setCustomerOfferCount(0)
                  }}
                  variant="outline"
                  disabled={saving}
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                >
                  <X className="mr-2 h-5 w-5" />
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomersPage
