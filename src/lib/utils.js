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
