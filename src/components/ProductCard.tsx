import { Plus } from 'lucide-react'
import type { Product } from '../types/Product'
import { useCart } from '../context/CartContext'
import { getMaxQuantity } from '../utils/cart'
import { storeConfig } from '../config/storeConfig'
import './ProductCard.css'

type ProductCardProps = {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart } = useCart()

  const quantityInCart =
    items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const limitReached = quantityInCart >= getMaxQuantity(product)

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price)

  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
          />
        ) : (
          <span>Foto do produto</span>
        )}

        {product.stock <= 0 && (
          <span className="product-unavailable">
            Esgotado
          </span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <h2>{product.name}</h2>

        {storeConfig.showStockCount && product.stock > 0 && (
          <p
            className={`product-stock${
              product.stock <= storeConfig.lowStockThreshold ? ' low' : ''
            }`}
          >
            Em estoque: {product.stock}{' '}
            {product.stock === 1 ? 'unidade' : 'unidades'}
          </p>
        )}

        <div className="product-footer">
          <strong>{formattedPrice}</strong>

          <button
            type="button"
            className="add-product-button"
            onClick={() => addToCart(product)}
            disabled={limitReached}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={19} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard