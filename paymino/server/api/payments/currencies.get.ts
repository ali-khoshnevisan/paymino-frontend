// GET /api/payments/currencies
export default defineEventHandler(() => ({
  currencies: listCurrencies(),
  invoiceTtlMinutes: INVOICE_TTL_MINUTES,
  sandbox: true,
}))
