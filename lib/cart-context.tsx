'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { calculateOrderTotals } from '@/lib/discount'

type CartItem = {
  // id — ключ строки корзины (для фасовок: `${productId}:${variant}`), productId — товар в БД
  id: string
  productId?: string
  name: string
  price: number
  image_url: string | null
  // Состав набора одной строкой — показывается в корзине и уходит менеджеру в заявке
  details?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'lumo-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- разовая гидратация из localStorage при монтировании
        setItems(JSON.parse(stored))
      } catch {
        // повреждённые данные — просто игнорируем
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function setQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const { total: totalPrice } = calculateOrderTotals(items)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart должен использоваться внутри CartProvider')
  return context
}