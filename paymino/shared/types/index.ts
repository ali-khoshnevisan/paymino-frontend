// Shared API contract between the Nuxt frontend and the (future) Django REST backend.
// The mock API in /server implements exactly these shapes, so switching to DRF
// only means pointing NUXT_PUBLIC_API_BASE at Django.

export type ProductType = 'gift_card' | 'account_recharge' | 'subscription'

export interface Category {
  slug: string
  name: string
  description: string
  icon: 'steam' | 'apple' | 'playstation' | 'tradingview' | 'ai'
  productCount: number
}

export interface Provider {
  slug: string
  name: string // Latin brand name, shown LTR
  categorySlug: string
}

export interface RequiredField {
  key: string
  label: string
  type: 'text' | 'email' | 'url'
  placeholder?: string
  help?: string
  required: boolean
}

export interface ProductVariant {
  id: string
  label: string // e.g. "$20" or "Plus – 1 month"
  faceValue?: number // gift card denomination
  faceCurrency?: string // USD, EUR, GBP ...
  region?: string // human-readable region
  durationMonths?: number
  priceToman: number
  available: boolean
}

export interface Product {
  id: string
  slug: string
  name: string // Persian display name
  brandName: string // Latin brand / product name
  categorySlug: string
  providerSlug: string
  type: ProductType
  shortDescription: string
  description: string
  imageUrl: string | null
  regions: string[]
  restrictions: string[]
  redemptionNotes: string[]
  deliveryMethod: string
  fulfillmentEstimate: string | null // only when backed by real operational data
  refundPolicy: string
  requiredFields: RequiredField[]
  maxQuantityPerItem: number // 1 for services that need per-item account info
  variants: ProductVariant[]
  available: boolean
  createdAt: string
}

export interface ProductListItem
  extends Pick<
    Product,
    | 'id'
    | 'slug'
    | 'name'
    | 'brandName'
    | 'categorySlug'
    | 'providerSlug'
    | 'type'
    | 'shortDescription'
    | 'imageUrl'
    | 'regions'
    | 'available'
    | 'createdAt'
  > {
  minPriceToman: number | null
  variantCount: number
  durations: number[]
}

export interface Paginated<T> {
  count: number
  results: T[]
}

export interface CatalogFilters {
  q?: string
  category?: string
  provider?: string
  region?: string
  duration?: number
  minPrice?: number
  maxPrice?: number
  ordering?: 'popular' | 'newest' | 'price_asc' | 'price_desc'
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface CatalogFacets {
  providers: FacetOption[]
  regions: FacetOption[]
  durations: FacetOption[]
  priceRange: { min: number; max: number } | null
}

/* ------------------------------ Cart / quote ------------------------------ */

export interface CartItemInput {
  lineId: string
  productId: string
  variantId: string
  quantity: number
  knownUnitPriceToman?: number // price the user last saw; server flags a change
}

export type QuoteIssueCode = 'unavailable' | 'price_changed' | 'quantity_adjusted' | 'not_found'

export interface QuoteLine {
  lineId: string
  productId: string
  variantId: string
  productName: string
  brandName: string
  variantLabel: string
  quantity: number
  unitPriceToman: number
  lineTotalToman: number
  available: boolean
  issue?: { code: QuoteIssueCode; message: string }
}

export interface Quote {
  lines: QuoteLine[]
  subtotalToman: number
  serviceFeeToman: number
  serviceFeeRate: number
  discountToman: number
  totalToman: number
  validUntil: string
}

/* --------------------------------- Users --------------------------------- */

export interface User {
  id: string
  fullName: string
  email: string
  phone: string | null
  emailVerified: boolean
  createdAt: string
}

/* ------------------------------- Payments ------------------------------- */

export interface CryptoNetwork {
  code: string // e.g. TRC20
  name: string
  minAmount: number
  confirmationsRequired: number
  networkFeeNote: string
}

export interface CryptoCurrency {
  code: string // USDT
  name: string
  networks: CryptoNetwork[]
  rateToman: number // Toman per 1 unit
  rateUpdatedAt: string
}

export type PaymentStatus =
  | 'awaiting_payment'
  | 'detected'
  | 'confirming'
  | 'confirmed'
  | 'expired'
  | 'underpaid'
  | 'failed'
  | 'refunded'

export interface PaymentInvoice {
  id: string
  orderId: string
  provider: string
  currency: string
  network: string
  amountCrypto: string // decimal string, never float math on client
  amountReceived: string | null
  rateToman: number
  totalToman: number
  address: string
  memo: string | null
  paymentUri: string | null
  expiresAt: string
  createdAt: string
  status: PaymentStatus
  confirmations: number
  confirmationsRequired: number
  txHash: string | null
  explorerUrl: string | null
  sandbox: boolean // true for the mock API — UI must warn the user not to pay
}

/* --------------------------------- Orders -------------------------------- */

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verification'
  | 'paid'
  | 'processing'
  | 'awaiting_customer_info'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'

export interface OrderItemDelivery {
  kind: 'code' | 'service_note'
  value: string
  deliveredAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productSlug: string
  productName: string
  brandName: string
  variantLabel: string
  type: ProductType
  quantity: number
  unitPriceToman: number
  lineTotalToman: number
  fields: Record<string, string>
  fieldLabels: Record<string, string>
  deliveries: OrderItemDelivery[]
}

export interface OrderEvent {
  at: string
  status: OrderStatus | null
  paymentStatus: PaymentStatus | null
  message: string
}

export interface Order {
  id: string
  number: string
  status: OrderStatus
  paymentStatus: PaymentStatus | null
  items: OrderItem[]
  subtotalToman: number
  serviceFeeToman: number
  discountToman: number
  totalToman: number
  paymentMethod: { currency: string; network: string } | null
  invoice: PaymentInvoice | null
  events: OrderEvent[]
  createdAt: string
  updatedAt: string
}

export interface OrderListItem {
  id: string
  number: string
  status: OrderStatus
  paymentStatus: PaymentStatus | null
  totalToman: number
  itemCount: number
  firstItemName: string
  createdAt: string
}

export interface CreateOrderInput {
  items: Array<CartItemInput & { fields: Record<string, string> }>
  currency: string
  network: string
  acceptedTerms: boolean
  expectedTotalToman: number
}

/* -------------------------------- Support -------------------------------- */

export type TicketStatus = 'open' | 'answered' | 'closed'

export interface SupportTicket {
  id: string
  number: string
  subject: string
  orderNumber: string | null
  status: TicketStatus
  messages: Array<{ from: 'user' | 'support'; body: string; at: string }>
  createdAt: string
  updatedAt: string
}

/* --------------------------------- Errors -------------------------------- */

// DRF-style error body: { detail } or field errors { field: [msg] }
export interface ApiErrorBody {
  detail?: string
  code?: string
  errors?: Record<string, string[]>
}
