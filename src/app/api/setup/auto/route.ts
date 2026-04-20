import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { businessId, userId } = await request.json()
    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const headers = {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
    }

    const results: Record<string, unknown> = {}

    // Step 1: Create Vapi assistant
    try {
      const vapiRes = await fetch(`${appUrl}/api/setup/vapi`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessId }),
      })
      results.vapi = await vapiRes.json()
    } catch (e) {
      results.vapi = { error: String(e) }
    }

    // Step 2: Provision Twilio number
    try {
      const twilioRes = await fetch(`${appUrl}/api/setup/twilio`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessId }),
      })
      results.twilio = await twilioRes.json()
    } catch (e) {
      results.twilio = { error: String(e) }
    }

    // Step 3: Setup Cal.com
    try {
      const calRes = await fetch(`${appUrl}/api/setup/calcom`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ businessId }),
      })
      results.calcom = await calRes.json()
    } catch (e) {
      results.calcom = { error: String(e) }
    }

    // Mark setup as completed
    await supabase
      .from('business_profiles')
      .update({
        setup_completed: true,
        onboarding_completed: true,
      })
      .eq('id', businessId)

    console.log(`[auto-setup] completed for business ${businessId}:`, results)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Auto-setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
