// Placeholder service for later expansion (e.g., using DB)
export function calculateTotal(items) {
  return items.reduce((s, it) => s + (Number(it.unit_price || it.price || 0) * Number(it.quantity || 1)), 0);
}
