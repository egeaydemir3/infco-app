/**
 * Deterministic formatting functions for dates and numbers
 * These functions ensure server and client render the same output
 */

/**
 * Format date as DD.MM.YYYY (deterministic, no locale differences)
 * Uses local time but ensures consistent formatting
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-'

  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  // Use local time but ensure consistent formatting
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear()

  return `${day}.${month}.${year}`
}

/**
 * Format currency amount as $X,XXX.XX (deterministic)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }

  // Use fixed decimal places and manual thousand separators for consistency
  const fixed = amount.toFixed(2)
  const parts = fixed.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // Add thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `$${formattedInteger}.${decimalPart}`
}

/**
 * Format number with thousand separators (no decimals)
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format number with decimals (for views, likes, etc.)
 */
export function formatNumberWithDecimals(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  if (decimals === 0) {
    return formatNumber(value)
  }

  const fixed = value.toFixed(decimals)
  const parts = fixed.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${formattedInteger}.${decimalPart}`
}

