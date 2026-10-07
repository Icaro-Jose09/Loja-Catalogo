import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from 'react'
  import type { Product } from '../types/Product'
  import { getMaxQuantity } from '../utils/cart'
  
  export type CartItem = {
    product: Product
    quantity: number
  }
  
  type CartContextData = {
    items: CartItem[]
    totalItems: number
    subtotal: number
    addToCart: (product: Product) => void
    removeFromCart: (productId: string) => void
    decreaseQuantity: (productId: string) => void
    clearCart: () => void
  }
  
  const CART_STORAGE_KEY = 'loja-catalogo:cart'
  
  function loadStoredCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
  
      if (!stored) return []
  
      const parsed: unknown = JSON.parse(stored)
  
      if (!Array.isArray(parsed)) return []
  
      return parsed.filter(
        (item): item is CartItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.product?.id === 'string' &&
          typeof item.product?.price === 'number' &&
          typeof item.product?.stock === 'number' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
        .map((item) => ({
          ...item,
          quantity: Math.min(item.quantity, getMaxQuantity(item.product)),
        }))
        .filter((item) => item.quantity > 0)
    } catch {
      return []
    }
  }
  
  const CartContext = createContext<CartContextData | undefined>(undefined)
  
  type CartProviderProps = {
    children: ReactNode
  }
  
  export function CartProvider({ children }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>(loadStoredCart)
  
    useEffect(() => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch {
        // storage cheio ou bloqueado: o carrinho continua funcionando em memória
      }
    }, [items])
  
    function addToCart(product: Product) {
      setItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.product.id === product.id,
        )
  
        if (existingItem) {
          return currentItems.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, getMaxQuantity(product)),
                }
              : item,
          )
        }
  
        if (getMaxQuantity(product) <= 0) return currentItems
  
        return [
          ...currentItems,
          {
            product,
            quantity: 1,
          },
        ]
      })
    }
  
    function removeFromCart(productId: string) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId),
      )
    }
  
    function decreaseQuantity(productId: string) {
      setItems((currentItems) =>
        currentItems
          .map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
        : item,
        )
        .filter((item) => item.quantity > 0),
    )
    }

    function clearCart() {
    setItems([])
    }
    const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
    )

    const subtotal = useMemo(
    () =>
        items.reduce(
          (total, item) => total + item.product.price * item.quantity,
        0,
        ),
    [items],
    )
    const value = {
    items,
    totalItems,
    subtotal,
    addToCart,
    removeFromCart,
    decreaseQuantity,
    clearCart,
    }
    return (
    <CartContext.Provider value={value}>
        {children}
    </CartContext.Provider>
    )
}
export function useCart() {
    const context = useContext(CartContext)

    if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider.')
    }

    return context
}