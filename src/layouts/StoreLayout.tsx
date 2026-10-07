import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useCart } from '../context/CartContext'

function StoreLayout() {
  const { totalItems } = useCart()

  return (
    <div className="app">
      <Header cartItemsCount={totalItems} />

      <main className="main-content">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  )
}

export default StoreLayout