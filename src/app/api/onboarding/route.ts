import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const serviceClient = createServiceClient()

    const businessData = {
      user_id: user.id,
      business_name: data.business_name,
      business_type: data.business_type,
      website: data.website || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'US',
      timezone: data.timezone || 'America/New_York',
      phone_number: data.phone_number,
      contact_name: data.contact_name,
      email: data.email || user.email,
      greeting_message: data.greeting_message,
      after_hours_message: data.after_hours_message,
      hours_of_operation: data.hours_of_operation || {},
      services: data.services || [],
      plan: data.plan || 'professional',
      billing_cycle: data.billing_cycle || 'monthly',
      onboarding_step: 'payment',
    }

    const { error } = await serviceClient
      .from('business_profiles')
      .upsert(businessData, { onConflict: 'user_id' })

    if (error) {
      console.error('Onboarding save error:', error)
      return NextResponse.json({ error: 'Failed to save business profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
