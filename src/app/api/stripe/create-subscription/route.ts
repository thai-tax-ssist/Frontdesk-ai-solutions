import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrRetrieveCustomer, createTrialSubscription } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, paymentMethodId, businessName } = await request.json()

    if (!priceId || !paymentMethodId) {
      return NextResponse.json({ error: 'priceId and paymentMethodId are required' }, { status: 400 })
    }

    const customerId = await createOrRetrieveCustomer({
      userId: user.id,
      email: user.email!,
      businessName: businessName || 'My Business',
    })

    const subscription = await createTrialSubscription({
      customerId,
      priceId,
      paymentMethodId,
      userId: user.id,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
