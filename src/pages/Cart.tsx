import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { MAX_QUANTITY_PER_PRODUCT, getMaxQuantity } from '../utils/cart'
import { storeConfig } from '../config/storeConfig'
import './Cart.css'

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function Cart() {
  const navigate = useNavigate()
  const {
    items,
    totalItems,
    subtotal,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <span className="eyebrow">PEDIDO</span>
        <h1 className="cart-title">Seu carrinho</h1>

        <div className="cart-empty">
          <ShoppingBag size={32} strokeWidth={1.6} />
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos do catálogo para montar seu pedido.</p>

          <Link to="/produtos" className="cart-button-primary">
            Ver produtos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <span className="eyebrow">PEDIDO</span>
      <h1 className="cart-title">Seu carrinho</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="cart-item">
              <div className="cart-item-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>Foto</span>
                )}
              </div>

              <div className="cart-item-info">
                <div className="cart-item-top">
                  <div>
                    <span className="product-category">
                      {product.category}
                    </span>
                    <h2>{product.name}</h2>
                    <span className="cart-item-unit">
                      {formatPrice(product.price)} cada
                    </span>

                    {quantity >= getMaxQuantity(product) && (
                      <span className="cart-item-limit">
                        {product.stock < MAX_QUANTITY_PER_PRODUCT
                          ? storeConfig.showStockCount
                            ? `Estoque máximo atingido (${product.stock})`
                            : 'Quantidade máxima disponível atingida'
                          : `Máximo de ${MAX_QUANTITY_PER_PRODUCT} por pedido`}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Remover ${product.name} do carrinho`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="cart-item-bottom">
                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(product.id)}
                      aria-label={`Diminuir quantidade de ${product.name}`}
                    >
                      <Minus size={15} />
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={quantity >= getMaxQuantity(product)}
                      aria-label={`Aumentar quantidade de ${product.name}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <strong>{formatPrice(product.price * quantity)}</strong>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Resumo</h2>

          <div className="cart-summary-row">
            <span>
              Subtotal ({totalItems}{' '}
              {totalItems === 1 ? 'item' : 'itens'})
            </span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <button
            type="button"
            className="cart-button-primary"
            onClick={() => navigate('/checkout')}
          >
            Finalizar pedido
          </button>

          <Link to="/produtos" className="cart-button-secondary">
            Continuar comprando
          </Link>

          <button
            type="button"
            className="cart-clear"
            onClick={clearCart}
          >
            Limpar carrinho
          </button>
        </aside>
      </div>
    </section>
  )
}

export default Cart