'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type CartLineItem = {
  id?: string;
  product_id?: string;
  productId?: string;
  quantity: number;
  price?: number;
  subtotal?: number;
};

type CheckoutFormProps = {
  cartItems: CartLineItem[];
  storeId: string;
  customerId: string;
  total: number;
};

export default function CheckoutForm({
  cartItems,
  storeId,
  customerId,
}: CheckoutFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    province: '',
    postalcode: '',
    country: 'DE',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const createResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          customerId,
          cartItems,
          shippingAddress: formData,
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const orderData = await createResponse.json();
      console.log('Order created:', orderData.orderId);

      // Step 2: Process payment (when 2Checkout integrated)
      const paymentResponse = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          amount: orderData.amount,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment processing failed');
      }

      await paymentResponse.json();

      // TODO: When 2Checkout is integrated, redirect to checkout URL
      // if (paymentData.checkoutUrl) {
      //   window.location.href = paymentData.checkoutUrl;
      //   return;
      // }

      // For now, redirect to order confirmation
      router.push(`/shop/order-confirmation?order_id=${orderData.orderId}`);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
      setError(message);
      console.error('Checkout error:', err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Street Address</label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border rounded"
          placeholder="123 Main St"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border rounded"
          placeholder="Berlin"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Province/State</label>
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Postal Code</label>
        <input
          type="text"
          name="postalcode"
          value={formData.postalcode}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border rounded"
          placeholder="10115"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border rounded"
          placeholder="Germany"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50 hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </form>
  );
}