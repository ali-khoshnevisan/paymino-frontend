// POST /api/payments/webhook — the ONLY way payment status changes (besides lazy expiry).
// Header X-Signature: hex HMAC-SHA256 of the raw body with PAYMENT_WEBHOOK_SECRET.
// In production this lives in Django; this mock shows the required checks.
import type { PaymentEvent } from '../../utils/payments'

export default defineEventHandler(async (event) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-only-webhook-secret'
  const raw = (await readRawBody(event, 'utf8')) ?? ''

  if (!verifySignature(raw, getHeader(event, 'x-signature'), secret)) {
    apiError(401, 'Invalid signature', { code: 'invalid_signature' })
  }

  let payload: PaymentEvent
  try {
    payload = JSON.parse(raw)
  } catch {
    apiError(400, 'Invalid JSON', { code: 'invalid_json' })
  }
  if (!payload.eventId || !payload.invoiceId || !payload.status) {
    apiError(400, 'Missing fields', { code: 'invalid_payload' })
  }

  return applyPaymentEvent(payload)
})
