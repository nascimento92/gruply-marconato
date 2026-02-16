export type UserRole = 'admin' | 'seller'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Credentials {
  email: string
  password: string
}

export interface Customer {
  id: string
  name: string
  identification?: string
  phone?: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  unitPrice: number // Selling price
  costPrice: number // Average cost price
  stockQuantity: number
}

export type StockMovementType = 'in' | 'out'

export interface StockMovement {
  id: string
  productId: string
  customerId?: string
  type: StockMovementType
  quantity: number
  unitPrice?: number // Transaction price (Sale price for 'out', Purchase price for 'in'?) 
  // Let's be specific:
  // For 'out': unitPrice is sale price. originalPrice is list price. discount is diff.
  // For 'in': unitPrice is purchase cost.

  originalPrice?: number // Original list price (for sales)
  discount?: number // Discount given (for sales)
  isPaid?: boolean // True if paid, false if pending (fiado)
  paymentDate?: string // Date when payment was received (for sales)

  totalValue?: number
  date: string
}

export interface DailySalesSummary {
  date: string
  totalSales: number
}

export interface MonthlySalesSummary {
  month: string
  totalSales: number
}
