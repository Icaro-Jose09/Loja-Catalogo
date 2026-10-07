import type { Product } from '../types/Product'

export const MAX_QUANTITY_PER_PRODUCT = 8

// Limite real por produto: o menor entre o máximo por pedido e o estoque.
export function getMaxQuantity(product: Pick<Product, 'stock'>) {
  return Math.max(0, Math.min(MAX_QUANTITY_PER_PRODUCT, product.stock))
}