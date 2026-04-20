import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (body.confirm !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ error: 'Confirmation text required' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // Get business profile to cancel Stripe subscription
    const { data: business } = await serviceClient
      .from('business_profiles')
      .select('stripe_customer_id, stripe_subscription_id, vapi_assistant_id')
      .eq('user_id', user.id)
      .single()

    // Cancel Stripe subscription if active
    if (business?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(business.stripe_subscription_id)
      } catch {
        // Non-fatal — subscription may already be canceled
      }
    }

    // Delete Vapi assistant if exists
    if (business?.vapi_assistant_id) {
      try {
        await fetch(`https://api.vapi.ai/assistant/${business.vapi_assistant_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
        })
      } catch {
        // Non-fatal
      }
    }

    // Delete all user data (cascades via FK)
    await serviceClient.from('call_logs').delete().eq('user_id', user.id)
    await serviceClient.from('subscription_events').delete().eq('user_id', user.id)
    await serviceClient.from('business_profiles').delete().eq('user_id', user.id)
    await serviceClient.from('profiles').delete().eq('id', user.id)

    // Log GDPR deletion request (non-fatal if it fails)
    await serviceClient.from('gdpr_deletion_log').insert({
      user_id: user.id,
      email: user.email,
      deleted_at: new Date().toISOString(),
      stripe_customer_id: business?.stripe_customer_id || null,
    })

    // Delete Supabase auth user
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Auth delete error:', deleteError)
    }

    return NextResponse.json({ success: true, message: 'All data deleted per GDPR Article 17' })
  } catch (error) {
    console.error('GDPR delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
