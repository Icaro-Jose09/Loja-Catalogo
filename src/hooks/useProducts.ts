import { useEffect, useState } from 'react'
import type { Product } from '../types/Product'
import { getProducts } from '../services/productService'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getProducts()
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  return {
    products,
    loading,
    error,
    reload: () => {
      setLoading(true)
      setError(false)
      setAttempt((current) => current + 1)
    },
  }
}