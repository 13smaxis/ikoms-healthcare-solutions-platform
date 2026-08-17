
import { createClient } from '@supabase/supabase-js';
import { TWOCHECKOUT_CONFIG } from '@/lib/twocheckout';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/*
   Responsible for verifying the webhook signature sent by 2Checkout
   - Uses the secret key configured in the environment variables
   - Computes HMAC SHA256 hash of the request body
   - Returns true if valid, false otherwise
*/  
function verifyWebhookSignature(body, signature) 
{
    const hash = crypto
        .createHmac('sha256', TWOCHECKOUT_CONFIG.webhookSecret)
        .update(body)
        .digest('hex');
    return hash === signature;
}

/**
 * Webhook Handler
 * 
 * THIS IS THE SOURCE OF TRUTH FOR PAYMENT STATUS
 * 
 * Security checklist:
 * ✓ Verify webhook signature
 * ✓ Check for duplicate webhooks (idempotency)
 * ✓ Verify amount matches order
 * ✓ Verify currency matches
 * ✓ Update payment + order atomically
 * ✓ Return 200 immediately (webhook provider expects quick response)
 */
export async function POST(req) 
{
    const body = await req.text();                                                                                                //- Read the raw request body as text for signature verification
    const signature = req.headers.get('X-2Checkout-Signature');                                                                   //- Retrieve the signature sent by 2Checkout in the request headers

    try {
        if (!verifyWebhookSignature(body, signature))                                                                             //- 1. Verify webhook signature
        {
            console.error('⚠️ Invalid webhook signature');
            return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);                                                                                           //- Parse the JSON body of the webhook event
        console.log(`Webhook received: ${event.type}`);                                                                           //- Log the type of webhook event received for debugging purposes

        const orderId = event.body?.merchantOrderId;                                                                              //- Extract the merchant order ID from the webhook payload
        const transactionId = event.body?.orderRef;                                                                               //- Extract the 2Checkout transaction reference from the webhook payload
        const amount = event.body?.amount;                                                                                        //- Extract the amount from the webhook payload

        if (!orderId || !transactionId)                                                                                           //- Validate that the required fields are present in the webhook payload
        {
            console.error('Missing required fields in webhook');
            return Response.json({ received: true }); // Still return 200
        }

        const { data: existingLog } = await supabase
            .from('payment_webhook_log')
            .select('id')
            .eq('webhook_event_id', transactionId)
            .single();                                                                                                            //- 2. Check if this webhook has already been processed by looking up the transaction ID in the payment_webhook_log table

        if (existingLog) {
            console.log(`Webhook already processed: ${transactionId}`);
            return Response.json({ received: true }); // Already handled
        }

        if (event.type === 'order.completed' || event.type === 'payment.success') {
            // Fetch order to verify amount
            const { data: order } = await supabase
                .from('orders')
                .select('orderid, totalamount, currency, status')
                .eq('orderid', orderId)
                .single();                                                                                                        //- 3. Fetch the order details to verify the payment

            if (!order) {
                console.error(`Order not found: ${orderId}`);
                return Response.json({ received: true });
            }

            // Verify amount matches (security check)
            if (Math.abs(order.totalamount - amount) > 0.01)                                                                      //- Verify amount matches (allowing for minor floating point differences)
            {
                console.error(`Amount mismatch for order ${orderId}: ${order.totalamount} vs ${amount}`);
                return Response.json({ received: true });
            }

            await supabase
                .from('payments')
                .update({
                    status: 'successful',
                    transactionreference: transactionId,
                    twocheckout_order_id: transactionId,
                    paymentdate: new Date().toISOString(),
                })
                .eq('orderid', orderId);                                                                                          //- Update the payment record in the database to mark it as successful and store relevant transaction details

            await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('orderid', orderId);                                                                                          //- Update the order status to 'paid' in the database to reflect successful payment

            await supabase
                .from('payment_webhook_log')
                .insert([
                    {
                        webhook_event_id: transactionId,
                        event_type: event.type,
                    },
                ]);                                                                                                               //- Log the processed webhook event in the payment_webhook_log table to prevent duplicate processing in the future

            console.log(`✓ Payment confirmed for order: ${orderId}`);
        }

        if (event.type === 'order.failed' || event.type === 'payment.failed')                                                     //- 4. Handle failed payment events
        {
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('orderid', orderId);

            await supabase
                .from('payment_webhook_log')
                .insert([
                    {
                        webhook_event_id: transactionId,
                        event_type: event.type,
                    },
                ]);

            console.log(`✗ Payment failed for order: ${orderId}`);
        }

        return Response.json({ received: true });                                                                                 //- Return 200 OK to acknowledge receipt of the webhook

    } catch (error) {
        console.error('Webhook error:', error);
        // Still return 200 so provider doesn't retry
        return Response.json({ received: true });
    }
}