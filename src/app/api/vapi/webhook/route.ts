import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const eventType: string = body.message?.type || body.type || ''

    // Cal.com booking notification
    if (body.type === 'cal_booking') {
      const businessId: string = body.businessId
      await supabase
        .from('call_logs')
        .update({ appointment_booked: true })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(1)
      return NextResponse.json({ received: true })
    }

    // Vapi call events
    const call = body.message?.call || body.call || {}
    const vapiCallId: string = call?.id || body.callId || ''

    if (eventType === 'end-of-call-report' || eventType === 'call-ended') {
      const transcript: string = body.message?.transcript || body.transcript || ''
      const summary: string = body.message?.summary || body.summary || ''
      const durationSeconds: number = body.message?.durationSeconds || call?.duration || 0
      const callerNumber: string = call?.customer?.number || body.callerNumber || 'Unknown'
      const assistantId: string = call?.assistantId || body.assistantId || ''
      const recordingUrl: string = body.message?.recordingUrl || call?.recordingUrl || ''
      const appointmentBooked: boolean = transcript.toLowerCase().includes('appointment') &&
        (transcript.toLowerCase().includes('booked') || transcript.toLowerCase().includes('scheduled'))

      // Find business by vapi_assistant_id
      const { data: business } = await supabase
        .from('business_profiles')
        .select('id, user_id')
        .eq('vapi_assistant_id', assistantId)
        .single()

      if (business) {
        const { data: logEntry } = await supabase
          .from('call_logs')
          .insert({
            business_id: business.id,
            user_id: business.user_id,
            caller_number: callerNumber,
            duration_seconds: durationSeconds,
            call_type: 'inbound',
            status: durationSeconds > 0 ? 'completed' : 'missed',
            summary,
            transcript,
            recording_url: recordingUrl,
            appointment_booked: appointmentBooked,
            vapi_call_id: vapiCallId,
          })
          .select()
          .single()

        // Trigger follow-up if enabled
        if (logEntry && callerNumber !== 'Unknown') {
          fetch(`${appUrl}/api/followup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
            },
            body: JSON.stringify({
              businessId: business.id,
              callLogId: logEntry.id,
              callerNumber,
              summary,
              appointmentBooked,
            }),
          }).catch(() => {})
        }
      }
    }

    if (eventType === 'status-update') {
      const status: string = body.message?.status || ''
      if (status === 'ringing') {
        // Optionally notify the business of an incoming call
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Twilio TwiML fallback — forward call to Vapi
export async function GET() {
  const vapiNumber = process.env.VAPI_PHONE_NUMBER || ''
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>${vapiNumber}</Dial>
</Response>`
  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
