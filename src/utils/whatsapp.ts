import type { CartItem } from '../context/CartContext'
import type { CheckoutData, PaymentMethod } from '../types/Order'
import { formatPrice } from './format'

const paymentLabels: Record<PaymentMethod, string> = {
  pix: 'Pix',
  card: 'Cartão (crédito ou débito)',
  cash: 'Dinheiro',
}

type OrderInput = {
  orderId: string
  items: CartItem[]
  subtotal: number
  form: CheckoutData
}

export function generateOrderId() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  const date = `${String(now.getFullYear()).slice(2)}${pad(
    now.getMonth() + 1,
  )}${pad(now.getDate())}`
  const code = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `PED-${date}-${code}`
}

function formatCashChange(value: string) {
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'))

  return Number.isFinite(parsed) && parsed > 0 ? formatPrice(parsed) : value
}

export function buildOrderMessage({
  orderId,
  items,
  subtotal,
  form,
}: OrderInput) {
  const lines: string[] = []

  lines.push(`*NOVO PEDIDO ${orderId}*`, '')

  lines.push('*Cliente*')
  lines.push(`Nome: ${form.name.trim()}`)
  lines.push(`Telefone: ${form.phone}`, '')

  lines.push('*Itens*')
  for (const { product, quantity } of items) {
    lines.push(
      `${quantity}x ${product.name} (${formatPrice(product.price)} un.) = ${formatPrice(
        product.price * quantity,
      )}`,
    )
  }
  lines.push('')

  lines.push(`*Subtotal:* ${formatPrice(subtotal)}`)
  lines.push(`*Total:* ${formatPrice(subtotal)}`, '')

  lines.push(`*Pagamento:* ${paymentLabels[form.paymentMethod]}`)
  if (form.paymentMethod === 'cash' && form.cashChange.trim()) {
    lines.push(`Troco para: ${formatCashChange(form.cashChange.trim())}`)
  }
  lines.push('')

  if (form.deliveryMethod === 'delivery') {
    lines.push('*Recebimento:* Entrega')

    const street = `${form.street.trim()}, ${form.number.trim()}`
    lines.push(
      form.complement.trim()
        ? `${street} - ${form.complement.trim()}`
        : street,
    )
    lines.push(
      `${form.neighborhood.trim()} - ${form.city.trim()}/${form.state.trim()}`,
    )
    lines.push(`CEP: ${form.cep}`)
  } else {
    lines.push('*Recebimento:* Retirada no local')
  }

  if (form.notes.trim()) {
    lines.push('', `*Observações:* ${form.notes.trim()}`)
  }

  return lines.join('\n')
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}