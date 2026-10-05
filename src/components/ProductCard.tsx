import { Plus } from 'lucide-react'
import type { Product } from '../types/Product'

type ProductCardProps = {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
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

        <div className="product-footer">
          <strong>{formattedPrice}</strong>

          <button
            type="button"
            className="add-product-button"
            disabled={product.stock <= 0}
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