// In-memory data store for the mock API. Resets when the dev server restarts.
// Replace with Django models: User, Session, Order, OrderItem, PaymentInvoice, SupportTicket.

import type { Order, SupportTicket } from '#shared/types'

export interface StoredUser {
  id: string
  fullName: string
  email: string
  phone: string | null
  passwordHash: string // scrypt — never plain text, even in the mock
  emailVerified: boolean
  verificationCode: string | null
  createdAt: string
}

export interface StoredOrder extends Order {
  userId: string
  idempotencyKey: string | null
}

export interface StoredTicket extends SupportTicket {
  userId: string
}

interface MockDb {
  users: Map<string, StoredUser>
  sessions: Map<string, { userId: string; expiresAt: number }>
  resetTokens: Map<string, { userId: string; expiresAt: number }>
  orders: Map<string, StoredOrder>
  tickets: Map<string, StoredTicket>
  processedWebhooks: Set<string>
  loginAttempts: Map<string, { count: number; resetAt: number }>
  counters: { order: number; ticket: number }
  seeded: boolean
}

const g = globalThis as unknown as { __paymino_db?: MockDb }

export const db: MockDb = (g.__paymino_db ??= {
  users: new Map(),
  sessions: new Map(),
  resetTokens: new Map(),
  orders: new Map(),
  tickets: new Map(),
  processedWebhooks: new Set(),
  loginAttempts: new Map(),
  counters: { order: 10240, ticket: 500 },
  seeded: false,
})

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function nextOrderNumber() {
  db.counters.order += 1
  return `PM-${db.counters.order}`
}

export function nextTicketNumber() {
  db.counters.ticket += 1
  return `T-${db.counters.ticket}`
}
