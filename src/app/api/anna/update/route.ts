import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      greeting_message,
      after_hours_message,
      anna_voice,
      anna_language,
      anna_personality,
      services,
      hours_of_operation,
      follow_up_sms_enabled,
      follow_up_email_enabled,
      follow_up_sms_template,
      follow_up_email_template,
    } = body

    const serviceClient = createServiceClient()

    const { data: business, error } = await serviceClient
      .from('business_profiles')
      .update({
        greeting_message,
        after_hours_message,
        anna_voice: anna_voice || 'luna',
        anna_language: anna_language || 'en',
        anna_personality: anna_personality || 'professional',
        services,
        hours_of_operation,
        follow_up_sms_enabled: follow_up_sms_enabled ?? false,
        follow_up_email_enabled: follow_up_email_enabled ?? false,
        follow_up_sms_template,
        follow_up_email_template,
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Push updated config to Vapi if assistant exists
    if (business.vapi_assistant_id) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      fetch(`${appUrl}/api/setup/vapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({ businessId: business.id }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Anna update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
