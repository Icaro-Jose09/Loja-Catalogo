import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
import './Products.css'

const ALL_CATEGORIES = 'Todos'

// Ignora acentos e maiúsculas: "cafe" encontra "Café".
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function Products() {
  const { products, loading, error, reload } = useProducts()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = normalize(search)

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        product.category === selectedCategory

      const matchesSearch =
        term === '' ||
        normalize(
          `${product.name} ${product.description} ${product.category}`,
        ).includes(term)

      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategory])

  function clearFilters() {
    setSearch('')
    setSelectedCategory(ALL_CATEGORIES)
  }

  return (
    <section className="products-page">
      <div className="products-heading">
        <div>
          <span className="eyebrow">CATÁLOGO</span>

          <h1>Produtos</h1>
        </div>
      </div>

      <div className="products-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`category-button${
              category === selectedCategory ? ' active' : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && (
        <div className="products-grid" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="product-skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="products-state" role="alert">
          <h2>Não foi possível carregar os produtos</h2>
          <p>Verifique sua conexão e tente novamente.</p>

          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="products-state">
          <h2>Nenhum produto encontrado</h2>
          <p>Tente outra busca ou outra categoria.</p>

          <button type="button" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Products