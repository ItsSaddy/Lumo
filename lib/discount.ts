type LineItem = { price: number; quantity: number }

export function calculateOrderTotals(items: LineItem[]) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { total }
}
