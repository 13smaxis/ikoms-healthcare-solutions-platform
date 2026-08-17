import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables for the orders client.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getOrderWithDetails(orderId: string) 
{
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
                *,
                order_items (
                                orderitemid,
                                productid,
                                quantity,
                                unitprice,
                                products (
                                            name,
                                            sku,
                                            image_url
                                          )
                ),
                payments (
                            paymentid,
                            status,
                            paymentmethod,
                            amount,
                            paymentdate,
                            transactionreference
                ),
                customers (
                            name,
                            email
                          )
        `)
        .eq('orderid', orderId)
        .single();

    if (error) throw error;
    return order;
}

export async function updateOrderStatus(orderId: string, status: string) 
{
    const { data, error } = await supabase
        .from('orders')
        .update({
            status,
            updatedat: new Date().toISOString()
        })
        .eq('orderid', orderId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/*
 * Creates a new payment record in the database.
 * @param paymentData - The data for the new payment record.
 * @returns The created payment record data.
 * @throws An error if the payment record creation fails.
 */
export async function createPaymentRecord(paymentData: {
                                                            orderid: string;
                                                            amount: number;
                                                            paymentmethod: string;
                                                            status: string;
                                                            transactionreference?: string;
                                                            twocheckout_order_id?: string;
                                                            twocheckout_merchant_order_id?: string;
                                                        }
    ) 
{
    const { data, error } = await supabase
        .from('payments')
        .insert([
            {
                ...paymentData,
                paymentdate: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}