import { ShoppingBag } from 'lucide-react'

function Home() {
  return (
    <>
    <section className="welcome">
        <span className="eyebrow">
        BEM-VINDO
        </span>

        <h1>
        Encontre seus
        <br />
        produtos favoritos.
        </h1>

        <p>
        Explore nosso catálogo e monte seu pedido de forma simples.
        </p>
</section>

    <section className="content-placeholder">
        <div>
        <ShoppingBag size={32} strokeWidth={1.5} />
        <h2>
            Seu catálogo começa aqui
        </h2>
        <p>
            Em breve seus produtos aparecerão nesta área.
        </p>
        </div>
    </section>
    </>
  )
}

export default Home