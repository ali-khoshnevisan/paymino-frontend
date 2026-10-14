import type { OrderStatus, PaymentStatus, ProductType, TicketStatus } from '#shared/types'

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'accent'

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone; hint: string }> = {
  pending_payment: { label: 'در انتظار پرداخت', tone: 'warning', hint: 'برای ادامه، فاکتور پرداخت را تکمیل کنید.' },
  payment_verification: { label: 'بررسی پرداخت', tone: 'info', hint: 'پرداخت شما در حال تأیید است.' },
  paid: { label: 'پرداخت‌شده', tone: 'accent', hint: 'پرداخت تأیید شد و سفارش به‌زودی انجام می‌شود.' },
  processing: { label: 'در حال انجام', tone: 'info', hint: 'سفارش شما در حال انجام است.' },
  awaiting_customer_info: { label: 'نیازمند اطلاعات شما', tone: 'warning', hint: 'برای ادامه، اطلاعات درخواستی را تکمیل کنید.' },
  completed: { label: 'تکمیل‌شده', tone: 'success', hint: 'سفارش با موفقیت انجام شد.' },
  failed: { label: 'ناموفق', tone: 'danger', hint: 'انجام سفارش ممکن نشد. پشتیبانی پیگیری می‌کند.' },
  cancelled: { label: 'لغوشده', tone: 'neutral', hint: 'این سفارش لغو شده است.' },
  refund_pending: { label: 'در انتظار بازپرداخت', tone: 'warning', hint: 'درخواست بازپرداخت در حال بررسی است.' },
  refunded: { label: 'بازپرداخت‌شده', tone: 'neutral', hint: 'مبلغ سفارش بازگردانده شد.' },
}

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone; hint: string }> = {
  awaiting_payment: { label: 'در انتظار پرداخت', tone: 'warning', hint: 'مبلغ را دقیقاً به آدرس نمایش‌داده‌شده ارسال کنید.' },
  detected: { label: 'شناسایی شد', tone: 'info', hint: 'تراکنش شما در شبکه دیده شد. منتظر تأییدها بمانید.' },
  confirming: { label: 'در حال تأیید شبکه', tone: 'info', hint: 'تراکنش در حال دریافت تأییدهای لازم از شبکه است.' },
  confirmed: { label: 'تأییدشده', tone: 'success', hint: 'پرداخت شما تأیید شد.' },
  expired: { label: 'منقضی‌شده', tone: 'neutral', hint: 'مهلت پرداخت تمام شد. اگر پرداخت نکرده‌اید، فاکتور جدید بگیرید.' },
  underpaid: { label: 'کم‌پرداخت', tone: 'danger', hint: 'مبلغ دریافتی کمتر از فاکتور است. با پشتیبانی تماس بگیرید.' },
  failed: { label: 'ناموفق', tone: 'danger', hint: 'پرداخت انجام نشد.' },
  refunded: { label: 'بازگشت‌داده‌شده', tone: 'neutral', hint: 'مبلغ پرداختی بازگردانده شد.' },
}

export const PRODUCT_TYPE: Record<ProductType, string> = {
  gift_card: 'گیفت کارت',
  account_recharge: 'شارژ حساب',
  subscription: 'فعال‌سازی اشتراک',
}

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  open: { label: 'باز', tone: 'warning' },
  answered: { label: 'پاسخ داده شد', tone: 'success' },
  closed: { label: 'بسته', tone: 'neutral' },
}
