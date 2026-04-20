import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createServiceClient>
) {
  const customerId = subscription.customer as string
  const status = subscription.status
  const priceId = subscription.items.data[0]?.price.id
  const plan = getPlanFromPriceId(priceId)
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

  await supabase
    .from('business_profiles')
    .update({
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      plan,
      current_period_end: currentPeriodEnd,
    })
    .eq('stripe_customer_id', customerId)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await handleSubscriptionChange(subscription, supabase)

          await supabase
            .from('business_profiles')
            .update({ onboarding_completed: true })
            .eq('stripe_customer_id', session.customer as string)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from('business_profiles')
          .update({ subscription_status: 'canceled' })
          .eq('stripe_customer_id', subscription.customer as string)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase
          .from('business_profiles')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string)
        break
      }

      case 'customer.subscription.trial_will_end': {
        // 3 days before trial ends — could send reminder email here
        break
      }
    }

    // Trigger auto-setup after subscription created/updated
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'checkout.session.completed'
    ) {
      const obj = event.data.object as Stripe.Subscription | Stripe.Checkout.Session
      const customerId = 'customer' in obj ? (obj.customer as string) : null
      if (customerId) {
        const { data: business } = await supabase
          .from('business_profiles')
          .select('id, user_id, setup_completed')
          .eq('stripe_customer_id', customerId)
          .single()

        if (business && !business.setup_completed) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          fetch(`${appUrl}/api/setup/auto`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
            },
            body: JSON.stringify({ businessId: business.id, userId: business.user_id }),
          }).catch(() => {})
        }
      }
    }

    await supabase.from('subscription_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event.data.object as Record<string, unknown>,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
