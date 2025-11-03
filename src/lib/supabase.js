import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error('Supabase environment variables are not configured. Please check your .env file or Vercel environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return { error }
}

// Company Settings
export const getCompanySettings = async () => {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .single()
  
  return { data, error }
}

export const updateCompanySettings = async (settings) => {
  const { data, error } = await supabase
    .from('company_settings')
    .update(settings)
    .eq('id', settings.id)
    .select()
  
  return { data, error }
}

// Service Categories
export const getServiceCategories = async () => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('active', true)
    .order('display_order')
  
  return { data, error }
}

export const getAllServiceCategories = async () => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('display_order')
  
  return { data, error }
}

export const createServiceCategory = async (category) => {
  const { data, error } = await supabase
    .from('service_categories')
    .insert([category])
    .select()
    .single()
  
  return { data, error }
}

export const updateServiceCategory = async (id, category) => {
  const { data, error } = await supabase
    .from('service_categories')
    .update(category)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export const deleteServiceCategory = async (id) => {
  const { data, error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id)
  
  return { data, error }
}

// Additional Services
export const getAdditionalServices = async (categoryId = null) => {
  let query = supabase
    .from('additional_services')
    .select('*')
    .eq('active', true)
    .order('display_order')
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const getAllAdditionalServices = async () => {
  const { data, error } = await supabase
    .from('additional_services')
    .select('*')
    .order('display_order')
  
  return { data, error }
}

export const createAdditionalService = async (service) => {
  const { data, error } = await supabase
    .from('additional_services')
    .insert([service])
    .select()
    .single()
  
  return { data, error }
}

export const updateAdditionalService = async (id, service) => {
  const { data, error } = await supabase
    .from('additional_services')
    .update(service)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export const deleteAdditionalService = async (id) => {
  const { data, error } = await supabase
    .from('additional_services')
    .delete()
    .eq('id', id)
  
  return { data, error }
}

// Customers
export const createCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single()
  
  return { data, error }
}

export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const searchCustomers = async (searchTerm) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,customer_number.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return { data, error }
}

export const getCustomer = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export const updateCustomer = async (id, customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
  
  return { data, error }
}

// Offers
export const createOffer = async (offerData) => {
  const { data, error } = await supabase
    .from('offers')
    .insert([offerData])
    .select()
    .single()
  
  return { data, error }
}

export const getOffers = async (filters = {}) => {
  let query = supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const getOffer = async (id) => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export const updateOffer = async (id, offerData) => {
  const { data, error } = await supabase
    .from('offers')
    .update(offerData)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export const deleteOffer = async (id) => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Storage
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) return { data: null, error }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return { data: { publicUrl }, error: null }
}
