import { z } from 'zod';

/**
 * Validation schemas for checkout flow
 * 
 * These ensure that:
 * 1. Client can't send malformed data
 * 2. Prices are validated
 * 3. Quantities are positive
 * 4. All required fields are present
 */

// Individual cart item schema
export const CartItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID required'),
  name: z.string().min(1, 'Product name required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  sku: z.string().optional(),
  image: z.string().optional(),
  variant_id: z.string().optional(),
  variant_title: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

// Shipping address schema
export const ShippingAddressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number too short').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  zip: z.string().min(2, 'ZIP/Postal code too short'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// Full checkout request schema
export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
  shippingAddress: ShippingAddressSchema,
  subtotal: z.number().positive('Subtotal must be positive'),
  tax: z.number().nonnegative('Tax cannot be negative').optional(),
  shipping: z.number().nonnegative('Shipping cannot be negative').optional(),
  total: z.number().positive('Total must be positive'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// Payment initiation schema
export const InitiatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID required'),
});

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;

// Payment status enum (matches database)
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

// Order status enum (matches database)
export type OrderStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded';

/**
 * Helper function to validate and return typed data
 */
export function validateCheckoutInput(data: unknown) {
  return CreateOrderSchema.safeParse(data);
}

export function validatePaymentInput(data: unknown) {
  return InitiatePaymentSchema.safeParse(data);
}