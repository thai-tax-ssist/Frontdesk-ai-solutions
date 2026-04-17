import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export async function createOrRetrieveCustomer({
  userId,
  email,
  businessName,
}: {
  userId: string
  email: string
  businessName: string
}) {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = createServiceClient()

  const { data: business } = await supabase
    .from('business_profiles')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (business?.stripe_customer_id) {
    return business.stripe_customer_id
  }

  const customer = await stripe.customers.create({
    email,
    name: businessName,
    metadata: { supabase_user_id: userId },
  })

  await supabase
    .from('business_profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId)

  return customer.id
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId: string
  priceId: string
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
      metadata: { supabase_user_id: userId },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { supabase_user_id: userId },
  })
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export function getPlanFromPriceId(priceId: string) {
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID
  const proPriceId = process.env.STRIPE_PROFESSIONAL_PRICE_ID
  const enterprisePriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID

  if (priceId === starterPriceId) return 'starter'
  if (priceId === proPriceId) return 'professional'
  if (priceId === enterprisePriceId) return 'enterprise'
  return 'starter'
}
