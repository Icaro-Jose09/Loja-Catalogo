import {
    Home,
    ShoppingBag,
    ShoppingCart,
    UserRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
const navigationItems = [
    {
    path: '/',
    label: 'Início',
    icon: Home,
    },
    {
    path: '/produtos',
    label: 'Produtos',
    icon: ShoppingBag,
    },
    {
    path: '/carrinho',
    label: 'Carrinho',
    icon: ShoppingCart,
    },
    {
    path: '/perfil',
    label: 'Perfil',
    icon: UserRound,
    },
]
function BottomNavigation() {
    return (
    <nav className="bottom-navigation" aria-label="Navegação principal">
        {navigationItems.map((item) => {
        const Icon = item.icon
        return (
            <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }: { isActive: boolean }) =>
                `navigation-item ${isActive ? 'active' : ''}`
        }

            >
            <span className="navigation-icon">
                <Icon size={21} strokeWidth={1.9} />
            </span>
            <span className="navigation-label">
                {item.label}
            </span>
            </NavLink>
)
        })}
    </nav>
    )
}  
export default BottomNavigation