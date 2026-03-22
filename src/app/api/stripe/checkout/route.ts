import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, currency, successUrl, cancelUrl, customerEmail, metadata } = body;

    // Build line items from cart
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: (currency || 'usd').toLowerCase(),
        product_data: {
          name: item.productName,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${req.nextUrl.origin}/checkout?success=true`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/checkout?canceled=true`,
      customer_email: customerEmail || undefined,
      metadata: metadata || {},
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout session error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
