import type { Product } from '../types/Product'

export const products: Product[] = [
  {
    id: '1',
    name: 'Produto exemplo 01',
    description: 'Descrição do produto exemplo.',
    price: 59.9,
    image: '',
    category: 'Novidades',
    stock: 10,
    active: true,
  },
  {
    id: '2',
    name: 'Produto exemplo 02',
    description: 'Descrição do segundo produto.',
    price: 89.9,
    image: '',
    category: 'Destaques',
    stock: 5,
    active: true,
  },
  {
    id: '3',
    name: 'Produto exemplo 03',
    description: 'Descrição do terceiro produto.',
    price: 39.9,
    image: '',
    category: 'Novidades',
    stock: 8,
    active: true,
  },
  {
    id: '4',
    name: 'Produto exemplo 04',
    description: 'Descrição do quarto produto.',
    price: 119.9,
    image: '',
    category: 'Destaques',
    stock: 3,
    active: true,
  },

]