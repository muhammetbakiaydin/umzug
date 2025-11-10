import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateFormat('de-CH').format(new Date(date))
}

export function generateCustomerNumber() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `C${timestamp}${random}`
}

export async function generateOfferNumber(supabase) {
  const { data, error } = await supabase
    .from('offers')
    .select('offer_number')
    .order('offer_number', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return '10001'
  }

  const lastNumber = parseInt(data[0].offer_number)
  return String(lastNumber + 1).padStart(5, '0')
}

export async function generateReceiptNumber(supabase) {
  const { data, error } = await supabase
    .from('offers')
    .select('receipt_number')
    .not('receipt_number', 'is', null)
    .order('receipt_number', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return 'Q-10001'
  }

  const lastNumber = parseInt(data[0].receipt_number.split('-')[1])
  return `Q-${String(lastNumber + 1).padStart(5, '0')}`
}

export async function generateInvoiceNumber(supabase) {
  const { data, error } = await supabase
    .from('offers')
    .select('invoice_number')
    .not('invoice_number', 'is', null)
    .order('invoice_number', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return 'R-10001'
  }

  const lastNumber = parseInt(data[0].invoice_number.split('-')[1])
  return `R-${String(lastNumber + 1).padStart(5, '0')}`
}
