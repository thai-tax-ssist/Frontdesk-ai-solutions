import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const serviceClient = createServiceClient()

    const [profileResult, businessResult, callsResult, eventsResult] = await Promise.all([
      serviceClient.from('profiles').select('*').eq('id', user.id).single(),
      serviceClient.from('business_profiles').select('*').eq('user_id', user.id).single(),
      serviceClient.from('call_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      serviceClient.from('subscription_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        profile: profileResult.data,
      },
      business_profile: businessResult.data
        ? {
            ...businessResult.data,
            // Redact sensitive integration IDs in export
            stripe_customer_id: '[REDACTED]',
            stripe_subscription_id: '[REDACTED]',
          }
        : null,
      call_logs: callsResult.data || [],
      subscription_events: (eventsResult.data || []).map((e) => ({
        id: e.id,
        event_type: e.event_type,
        created_at: e.created_at,
      })),
      gdpr_notice: 'This export contains all personal data held about you per GDPR Article 20 (Right to Data Portability).',
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="frontdesk-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch (error) {
    console.error('GDPR export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
