// Admin panel API contract (Django: /api/admin/*). Staff-only.
import type { Order, OrderStatus, PaymentInvoice, PaymentStatus, ProductType, RequiredField, TicketStatus } from './index'

export type StockMode = 'codes' | 'manual'
export type CategoryIconKey = 'steam' | 'apple' | 'playstation' | 'tradingview' | 'ai'

export interface AdminList<T> {
    count: number
    results: T[]
}

export interface AdminUserRef {
    id: string
    fullName: string
    email: string
    phone?: string | null
}

export interface AdminOrderRow {
    id: string
    number: string
    status: OrderStatus
    paymentStatus: PaymentStatus | null
    totalToman: number
    itemCount: number
    firstItemName: string
    needsReview: boolean
    user: AdminUserRef
    createdAt: string
    updatedAt: string
}

export interface AdminOrderEvent {
    at: string
    status: OrderStatus | null
    paymentStatus: PaymentStatus | null
    message: string
    internal: boolean
    actor: string | null
}

export interface AdminOrder extends Order {
    needsReview: boolean
    adminNote: string
    user: AdminUserRef
    allEvents: AdminOrderEvent[]
    invoices: Array<PaymentInvoice & { providerRef: string }>
    allowedTransitions: OrderStatus[]
    items: Array<Order['items'][number] & { stockMode: StockMode; variantId: string | null }>
    tickets: Array<{ id: string; number: string; status: TicketStatus }>
}

export interface AdminDashboard {
    revenue: { today: number; last7Days: number; last30Days: number }
    orders: { today: number; last30Days: number; byStatus: Partial<Record<OrderStatus, number>> }
    users: { total: number; newLast30Days: number }
    openTickets: number
    needsAction: AdminList<AdminOrderRow>
    lowStock: Array<{ variantId: string; productId: string; productName: string; label: string; stock: number }>
    series: Array<{ date: string; revenueToman: number; orders: number }>
}

export interface AdminCategory {
    id: number
    slug: string
    name: string
    description: string
    icon: CategoryIconKey
    sortOrder: number
    isActive: boolean
    productCount: number | null
}

export interface AdminProvider {
    id: number
    slug: string
    name: string
    categoryId: number
    productCount: number | null
}

export interface AdminVariant {
    id: string
    label: string
    faceValue: number | null
    faceCurrency: string
    region: string
    durationMonths: number | null
    priceToman: number
    stockMode: StockMode
    isActive: boolean
    sortOrder: number
    stock: number
    available: boolean
}

export interface AdminProductRow {
    id: string
    slug: string
    name: string
    brandName: string
    categoryName: string
    type: ProductType
    isActive: boolean
    imageUrl: string | null
    variantCount: number
    minPriceToman: number | null
    stock: number | null
    lowStock: boolean
    popularity: number
    createdAt: string
}

export interface AdminProduct {
    id: string
    slug: string
    name: string
    brandName: string
    categoryId: number
    categoryName: string
    providerId: number
    providerName: string
    type: ProductType
    shortDescription: string
    description: string
    imageUrl: string | null
    regions: string[]
    restrictions: string[]
    redemptionNotes: string[]
    deliveryMethod: string
    fulfillmentEstimate: string
    refundPolicy: string
    requiredFields: RequiredField[]
    maxQuantityPerItem: number
    popularity: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    variants: AdminVariant[]
}

export type GiftCodeStatus = 'available' | 'delivered' | 'void'

export interface AdminGiftCode {
    id: number
    code: string
    status: GiftCodeStatus
    note: string
    createdAt: string
    deliveredAt: string | null
    orderNumber: string | null
    orderId: string | null
}

export interface AdminUserRow {
    id: string
    fullName: string
    email: string
    phone: string | null
    emailVerified: boolean
    isActive: boolean
    isStaff: boolean
    isSuperuser: boolean
    createdAt: string
    lastLogin: string | null
    orderCount: number | null
    totalSpentToman: number
}

export interface AdminUser extends AdminUserRow {
    adminNote: string
}

export interface AdminTicketRow {
    id: string
    number: string
    subject: string
    status: TicketStatus
    orderNumber: string | null
    orderId: string | null
    user: AdminUserRef
    lastMessageFrom: 'user' | 'support' | null
    createdAt: string
    updatedAt: string
}

export interface AdminTicket extends AdminTicketRow {
    messages: Array<{ id: number; from: 'user' | 'support'; body: string; at: string; author: string | null }>
}

export interface AdminSettings {
    serviceFeeRate: number
    invoiceTtlMinutes: number
    ordersEnabled: boolean
    lowStockThreshold: number
    supportEmail: string
    paymentProvider: 'sandbox' | 'plisio'
}

export interface AdminNetwork {
    id: number
    code: string
    name: string
    minAmount: string
    confirmationsRequired: number
    networkFeeNote: string
    gatewayCode: string
    explorerTxUrl: string
    isActive: boolean
}

export interface AdminCurrency {
    id: number
    code: string
    name: string
    decimals: number
    rateToman: number
    rateUpdatedAt: string
    isActive: boolean
    sortOrder: number
    networks: AdminNetwork[]
}