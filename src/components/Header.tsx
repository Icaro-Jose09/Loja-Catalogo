import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

type HeaderProps = {
cartItemsCount?: number
}

function Header({ cartItemsCount = 0 }: HeaderProps) {
return (
    <header className="topbar">
    <div className="brand">
        <span className="brand-mark">L</span>

<div>
        <strong>Loja</strong>
        <span>Catálogo</span>
        </div>
    </div>

    <Link to="/carrinho" className="cart-button" aria-label="Abrir carrinho">
        <ShoppingCart size={20} />

        {cartItemsCount > 0 && (
        <span className="cart-badge">
            {cartItemsCount}
        </span>
        )}
    </Link>
    </header>
)
}

export default Header