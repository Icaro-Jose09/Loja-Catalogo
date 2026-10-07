import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
  } from 'react'
  import { Link, Navigate, useNavigate } from 'react-router-dom'
  import { ArrowLeft, Banknote, Check, CreditCard, QrCode } from 'lucide-react'
  import { useCart } from '../context/CartContext'
  import type {
    CheckoutData,
    DeliveryMethod,
    PaymentMethod,
  } from '../types/Order'
  import { storeConfig } from '../config/storeConfig'
  import {
    buildOrderMessage,
    buildWhatsAppUrl,
    generateOrderId,
  } from '../utils/whatsapp'
  import './Checkout.css'
  
  const STORAGE_KEY = 'loja-catalogo:checkout'
  
  const emptyForm: CheckoutData = {
    name: '',
    phone: '',
    deliveryMethod: 'pickup',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    notes: '',
    paymentMethod: 'pix',
    cashChange: '',
  }
  
  function formatPrice(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }
  
  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
  
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  
  function formatCep(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
  
    if (digits.length <= 5) return digits
  
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  
  type CepStatus = 'idle' | 'loading' | 'found' | 'notfound' | 'error'
  
  type ViaCepResponse = {
    logradouro?: string
    bairro?: string
    localidade?: string
    uf?: string
    erro?: boolean | string
  }
  
  function loadStoredForm(): CheckoutData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
  
      if (!stored) return emptyForm
  
      const parsed: unknown = JSON.parse(stored)
  
      if (typeof parsed !== 'object' || parsed === null) return emptyForm
  
      // Mescla com o formulário vazio para garantir que todos os campos existam.
      // Observações e troco não são lembrados: mudam a cada pedido.
      return { ...emptyForm, ...parsed, notes: '', cashChange: '' }
    } catch {
      return emptyForm
    }
  }
  
  type Errors = Partial<Record<keyof CheckoutData, string>>
  
  function validate(form: CheckoutData): Errors {
    const errors: Errors = {}
  
    if (form.name.trim().length < 3) {
      errors.name = 'Informe seu nome completo.'
    }
  
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      errors.phone = 'Informe um telefone válido com DDD.'
    }
  
    if (form.deliveryMethod === 'delivery') {
      if (form.cep.replace(/\D/g, '').length !== 8) {
        errors.cep = 'Informe um CEP com 8 números.'
      }
      if (!form.street.trim()) errors.street = 'Informe a rua.'
      if (!form.number.trim()) errors.number = 'Informe o número.'
      if (!form.neighborhood.trim()) errors.neighborhood = 'Informe o bairro.'
      if (!form.city.trim()) errors.city = 'Informe a cidade.'
      if (form.state.trim().length !== 2) errors.state = 'Informe a UF.'
    }
  
    return errors
  }
  
  const paymentOptions: {
    value: PaymentMethod
    label: string
    hint: string
    icon: typeof QrCode
  }[] = [
    { value: 'pix', label: 'Pix', hint: 'Chave enviada no WhatsApp', icon: QrCode },
    { value: 'card', label: 'Cartão', hint: 'Crédito ou débito', icon: CreditCard },
    { value: 'cash', label: 'Dinheiro', hint: 'Pague na entrega/retirada', icon: Banknote },
  ]
  
  function Checkout() {
    const navigate = useNavigate()
    const { items, totalItems, subtotal, clearCart } = useCart()
  
    const [form, setForm] = useState<CheckoutData>(loadStoredForm)
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [sentOrder, setSentOrder] = useState<{
      id: string
      url: string
    } | null>(null)
    const [cepStatus, setCepStatus] = useState<CepStatus>('idle')
  
    const abortRef = useRef<AbortController | null>(null)
    const numberRef = useRef<HTMLInputElement>(null)
  
    useEffect(() => () => abortRef.current?.abort(), [])
  
    useEffect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      } catch {
        // sem problema: apenas não lembra os dados na próxima compra
      }
    }, [form])
  
    const errors = useMemo(() => validate(form), [form])
  
    if (sentOrder) {
      return (
        <section className="checkout-page">
          <div className="order-sent">
            <span className="order-sent-icon">
              <Check size={28} strokeWidth={2.4} />
            </span>
  
            <h1>Quase lá!</h1>
  
            <p>
              Seu pedido <strong>{sentOrder.id}</strong> está pronto. Envie a
              mensagem no WhatsApp para a loja confirmar.
            </p>
  
            <a
              href={sentOrder.url}
              target="_blank"
              rel="noreferrer"
              className="checkout-submit order-sent-link"
            >
              Abrir WhatsApp novamente
            </a>
  
            <button
              type="button"
              className="order-sent-done"
              onClick={finishOrder}
            >
              Já enviei, concluir pedido
            </button>
          </div>
        </section>
      )
    }
  
    if (items.length === 0) {
      return <Navigate to="/carrinho" replace />
    }
  
    function update<K extends keyof CheckoutData>(
      field: K,
      value: CheckoutData[K],
    ) {
      setForm((current) => ({ ...current, [field]: value }))
    }
  
    function blur(field: keyof CheckoutData) {
      setTouched((current) => ({ ...current, [field]: true }))
    }
  
    async function lookupCep(digits: string) {
      abortRef.current?.abort()
  
      const controller = new AbortController()
      abortRef.current = controller
  
      setCepStatus('loading')
  
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${digits}/json/`,
          { signal: controller.signal },
        )
  
        if (!response.ok) throw new Error('Falha ao consultar o CEP')
  
        const data: ViaCepResponse = await response.json()
  
        if (data.erro) {
          setCepStatus('notfound')
          return
        }
  
        // CEPs gerais (de cidade pequena) vêm sem rua/bairro: ficam vazios para digitar.
        setForm((current) => ({
          ...current,
          street: data.logradouro ?? '',
          neighborhood: data.bairro ?? '',
          city: data.localidade ?? '',
          state: data.uf ?? '',
        }))
        setCepStatus('found')
  
        requestAnimationFrame(() => numberRef.current?.focus())
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
  
        setCepStatus('error')
      }
    }
  
    function handleCepChange(value: string) {
      const formatted = formatCep(value)
      const digits = formatted.replace(/\D/g, '')
  
      update('cep', formatted)
  
      if (digits.length === 8) {
        lookupCep(digits)
      } else {
        abortRef.current?.abort()
        setCepStatus('idle')
      }
    }
  
    function fieldError(field: keyof CheckoutData) {
      return touched[field] ? errors[field] : undefined
    }
  
    function handleSubmit(event: FormEvent) {
      event.preventDefault()
  
      const allTouched: Record<string, boolean> = {}
      for (const key of Object.keys(form)) allTouched[key] = true
      setTouched(allTouched)
  
      if (Object.keys(errors).length > 0) {
        const firstInvalid = document.querySelector('[aria-invalid="true"]')
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus()
        return
      }
  
      const orderId = generateOrderId()
      const message = buildOrderMessage({ orderId, items, subtotal, form })
      const url = buildWhatsAppUrl(storeConfig.whatsappNumber, message)
  
      setSentOrder({ id: orderId, url })
  
      // Se o navegador bloquear a nova aba, abre na mesma aba.
      const opened = window.open(url, '_blank')
      if (!opened) window.location.href = url
    }
  
    function finishOrder() {
      clearCart()
      navigate('/', { replace: true })
    }
  
    const isDelivery = form.deliveryMethod === 'delivery'
  
    return (
      <section className="checkout-page">
        <Link to="/carrinho" className="checkout-back">
          <ArrowLeft size={16} />
          Voltar ao carrinho
        </Link>
  
        <span className="eyebrow">FINALIZAR</span>
        <h1 className="checkout-title">Seu pedido</h1>
  
        <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
          <div className="checkout-fields">
            {/* ---------- Dados do cliente ---------- */}
            <fieldset className="checkout-section">
              <legend>Seus dados</legend>
  
              <div className="field">
                <label htmlFor="name">Nome</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  onBlur={() => blur('name')}
                  aria-invalid={Boolean(fieldError('name'))}
                  placeholder="Seu nome completo"
                />
                {fieldError('name') && (
                  <span className="field-error">{fieldError('name')}</span>
                )}
              </div>
  
              <div className="field">
                <label htmlFor="phone">Telefone / WhatsApp</label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', formatPhone(e.target.value))}
                  onBlur={() => blur('phone')}
                  aria-invalid={Boolean(fieldError('phone'))}
                  placeholder="(11) 99999-9999"
                />
                {fieldError('phone') && (
                  <span className="field-error">{fieldError('phone')}</span>
                )}
              </div>
            </fieldset>
  
            {/* ---------- Retirada ou entrega ---------- */}
            <fieldset className="checkout-section">
              <legend>Como você quer receber?</legend>
  
              <div className="choice-grid choice-grid-2">
                {(
                  [
                    { value: 'pickup', label: 'Retirada', hint: 'Buscar no local' },
                    { value: 'delivery', label: 'Entrega', hint: 'Receber no endereço' },
                  ] as { value: DeliveryMethod; label: string; hint: string }[]
                ).map((option) => (
                  <label key={option.value} className="choice-card">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={option.value}
                      checked={form.deliveryMethod === option.value}
                      onChange={() => update('deliveryMethod', option.value)}
                    />
                    <strong>{option.label}</strong>
                    <span>{option.hint}</span>
                  </label>
                ))}
              </div>
  
              {isDelivery && (
                <div className="address-fields">
                  <div className="field field-full">
                    <label htmlFor="cep">CEP</label>
                    <input
                      id="cep"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      onBlur={() => blur('cep')}
                      aria-invalid={Boolean(fieldError('cep'))}
                      placeholder="00000-000"
                    />
                    {fieldError('cep') && (
                      <span className="field-error">{fieldError('cep')}</span>
                    )}
                    {cepStatus === 'loading' && (
                      <span className="field-status">Buscando endereço...</span>
                    )}
                    {cepStatus === 'found' && (
                      <span className="field-status">
                        Endereço encontrado. Confira e informe o número.
                      </span>
                    )}
                    {cepStatus === 'notfound' && (
                      <span className="field-error">
                        CEP não encontrado. Confira os números ou preencha o
                        endereço manualmente.
                      </span>
                    )}
                    {cepStatus === 'error' && (
                      <span className="field-error">
                        Não foi possível buscar o CEP agora. Preencha o endereço
                        manualmente.
                      </span>
                    )}
                  </div>
  
                  <div className="field field-wide">
                    <label htmlFor="street">Rua</label>
                    <input
                      id="street"
                      type="text"
                      autoComplete="address-line1"
                      value={form.street}
                      onChange={(e) => update('street', e.target.value)}
                      onBlur={() => blur('street')}
                      aria-invalid={Boolean(fieldError('street'))}
                    />
                    {fieldError('street') && (
                      <span className="field-error">{fieldError('street')}</span>
                    )}
                  </div>
  
                  <div className="field field-narrow">
                    <label htmlFor="number">Número</label>
                    <input
                      id="number"
                      ref={numberRef}
                      type="text"
                      inputMode="numeric"
                      value={form.number}
                      onChange={(e) => update('number', e.target.value)}
                      onBlur={() => blur('number')}
                      aria-invalid={Boolean(fieldError('number'))}
                    />
                    {fieldError('number') && (
                      <span className="field-error">{fieldError('number')}</span>
                    )}
                  </div>
  
                  <div className="field field-full">
                    <label htmlFor="neighborhood">Bairro</label>
                    <input
                      id="neighborhood"
                      type="text"
                      autoComplete="address-level3"
                      value={form.neighborhood}
                      onChange={(e) => update('neighborhood', e.target.value)}
                      onBlur={() => blur('neighborhood')}
                      aria-invalid={Boolean(fieldError('neighborhood'))}
                    />
                    {fieldError('neighborhood') && (
                      <span className="field-error">
                        {fieldError('neighborhood')}
                      </span>
                    )}
                  </div>
  
                  <div className="field field-wide">
                    <label htmlFor="city">Cidade</label>
                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      onBlur={() => blur('city')}
                      aria-invalid={Boolean(fieldError('city'))}
                    />
                    {fieldError('city') && (
                      <span className="field-error">{fieldError('city')}</span>
                    )}
                  </div>
  
                  <div className="field field-narrow">
                    <label htmlFor="state">UF</label>
                    <input
                      id="state"
                      type="text"
                      maxLength={2}
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={(e) =>
                        update('state', e.target.value.toUpperCase())
                      }
                      onBlur={() => blur('state')}
                      aria-invalid={Boolean(fieldError('state'))}
                    />
                    {fieldError('state') && (
                      <span className="field-error">{fieldError('state')}</span>
                    )}
                  </div>
  
                  <div className="field field-full">
                    <label htmlFor="complement">
                      Complemento <small>(opcional)</small>
                    </label>
                    <input
                      id="complement"
                      type="text"
                      value={form.complement}
                      onChange={(e) => update('complement', e.target.value)}
                      placeholder="Apto, bloco, ponto de referência"
                    />
                  </div>
                </div>
              )}
            </fieldset>
  
            {/* ---------- Pagamento ---------- */}
            <fieldset className="checkout-section">
              <legend>Forma de pagamento</legend>
  
              <div className="choice-grid choice-grid-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
  
                  return (
                    <label key={option.value} className="choice-card">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={form.paymentMethod === option.value}
                        onChange={() => update('paymentMethod', option.value)}
                      />
                      <Icon size={20} strokeWidth={1.8} />
                      <strong>{option.label}</strong>
                      <span>{option.hint}</span>
                    </label>
                  )
                })}
              </div>
  
              {form.paymentMethod === 'cash' && (
                <div className="field">
                  <label htmlFor="cashChange">
                    Troco para quanto? <small>(opcional)</small>
                  </label>
                  <input
                    id="cashChange"
                    type="text"
                    inputMode="decimal"
                    value={form.cashChange}
                    onChange={(e) => update('cashChange', e.target.value)}
                    placeholder="Ex: 100"
                  />
                </div>
              )}
            </fieldset>
  
            {/* ---------- Observações ---------- */}
            <fieldset className="checkout-section">
              <legend>Observações</legend>
  
              <div className="field">
                <label htmlFor="notes" className="sr-only">
                  Observações do pedido
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Alguma observação sobre o pedido? (opcional)"
                />
              </div>
            </fieldset>
          </div>
  
          {/* ---------- Resumo ---------- */}
          <aside className="checkout-summary">
            <h2>Resumo</h2>
  
            <ul className="checkout-summary-list">
              {items.map(({ product, quantity }) => (
                <li key={product.id}>
                  <span>
                    {quantity}× {product.name}
                  </span>
                  <span>{formatPrice(product.price * quantity)}</span>
                </li>
              ))}
            </ul>
  
            <div className="checkout-summary-row">
              <span>
                Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
  
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
  
            <button type="submit" className="checkout-submit">
              Enviar pedido pelo WhatsApp
            </button>
          </aside>
        </form>
      </section>
    )
  }
  
  export default Checkout