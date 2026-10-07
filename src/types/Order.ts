export type DeliveryMethod = 'pickup' | 'delivery'

export type PaymentMethod = 'pix' | 'card' | 'cash'

export type CheckoutData = {
  name: string
  phone: string
  deliveryMethod: DeliveryMethod
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  complement: string
  notes: string
  paymentMethod: PaymentMethod
  cashChange: string
}