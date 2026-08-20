export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number;
  image?: string;
}

export function getCart(): CartItem[] 

{
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}

export function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.product_id === item.product_id && c.variant_id === item.variant_id);
  if (idx >= 0) cart[idx].quantity += qty;
  else cart.push({ ...item, quantity: qty });
  saveCart(cart);
}

export function removeFromCart(product_id: string, variant_id?: string) {
  saveCart(getCart().filter(c => !(c.product_id === product_id && c.variant_id === variant_id)));
}

export function updateQty(product_id: string, qty: number, variant_id?: string) {
  const cart = getCart();
  const idx = cart.findIndex(c => c.product_id === product_id && c.variant_id === variant_id);
  if (idx >= 0) {
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].quantity = qty;
    saveCart(cart);
  }
}

export function cartSubtotal(): number {
  return getCart().reduce((s, i) => s + i.price * i.quantity, 0);
}

export function clearCart() {
  saveCart([]);
}

export const fmt = (cents: number) => `£${(Number(cents) / 100).toFixed(2)}`;

export const formatPounds = (amount: number) => `£${Number(amount).toFixed(2)}`;

export const minorUnitsToPounds = (value: number | string | null | undefined) => {
  const amount = Number(value) || 0;
  return amount / 100;
};