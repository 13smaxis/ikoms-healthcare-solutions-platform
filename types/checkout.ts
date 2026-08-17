
/*
 * Represents the structure of the checkout form data.
 * This includes the request and response structures for creating an order.
 * The CheckoutFormData interface defines the fields required for the shipping address during checkout.
 */
export interface CheckoutFormData 
{
  street: string;
  city: string;
  province?: string;
  postalcode: string;
  country: string;
}

/*
 * Represents the structure of a request to create an order.
 * It includes the store ID, customer ID, cart items, and shipping address.
 * This interface is used to send the necessary data to the server when creating a new order.
 */
export interface CreateOrderRequest 
{
  storeId: string;
  customerId: string;
  cartItems: CartItem[];
  shippingAddress: CheckoutFormData;
}

/*
 * Represents the structure of a response after creating an order.
 * It includes the order ID, total amount, and currency.
 * This interface is used to capture the response from the server after an order is successfully created.
 */
export interface CartItem 
{
  productid: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
}

/*
 * Represents the structure of a response after creating an order.
 * It includes the order ID, total amount, and currency.
 * This interface is used to capture the response from the server after an order is successfully created.
 */
export interface CreateOrderResponse 
{
  orderId: string;
  amount: number;
  currency: string;
}