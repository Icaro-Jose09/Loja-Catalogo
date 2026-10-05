import { Search } from 'lucide-react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

function Products() {
  return (
    <section className="products-page">
      <div className="products-heading">
        <div>
          <span className="eyebrow">
            CATÁLOGO
          </span>

          <h1>Produtos</h1>
        </div>
      </div>

      <div className="products-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
        />
      </div>

      <div className="category-list">
        <button
          type="button"
          className="category-button active"
        >
          Todos
        </button>

        <button
          type="button"
          className="category-button"
        >
          Novidades
        </button>

        <button
          type="button"
          className="category-button"
        >
          Destaques
        </button>
      </div>

      <div className="products-grid">
        {products
          .filter((product) => product.active)
          .map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
      </div>
    </section>
  )
}

export default Products