import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const CALCOM_BASE = 'https://api.cal.com/v1'

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { businessId } = await request.json()
    const supabase = createServiceClient()

    const { data: business, error } = await supabase
      .from('business_profiles')
      .select('id, business_name, timezone, cal_username, services, hours_of_operation')
      .eq('id', businessId)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const apiKey = process.env.CAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'CAL_API_KEY not configured' }, { status: 500 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create a webhook on Cal.com to notify us of new bookings
    const webhookRes = await fetch(`${CALCOM_BASE}/hooks?apiKey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriberUrl: `${appUrl}/api/vapi/webhook`,
        triggerEvent: 'BOOKING_CREATED',
        active: true,
        payloadTemplate: JSON.stringify({
          businessId,
          type: 'cal_booking',
          booking: '{{booking}}',
        }),
      }),
    })

    // Cal.com webhook creation — non-fatal if it fails
    if (!webhookRes.ok) {
      console.warn('Cal.com webhook creation failed:', await webhookRes.text())
    }

    // Store cal_username from env if not set
    const calUsername = business.cal_username || process.env.NEXT_PUBLIC_CAL_USERNAME
    if (calUsername && !business.cal_username) {
      await supabase
        .from('business_profiles')
        .update({ cal_username: calUsername })
        .eq('id', businessId)
    }

    return NextResponse.json({ calUsername, webhookCreated: webhookRes.ok })
  } catch (error) {
    console.error('Cal.com setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
