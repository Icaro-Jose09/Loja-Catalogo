import { supabase } from '../lib/supabase'
import type { Product } from '../types/Product'

type ProductRow = {
  id: string
  name: string
  description: string
  price: number | string
  image_url: string
  stock: number
  active: boolean
  categories: { name: string } | null
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, description, price, image_url, stock, active, categories(name)',
    )
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as unknown as ProductRow[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image_url,
    category: row.categories?.name ?? 'Sem categoria',
    stock: row.stock,
    active: row.active,
  }))
}