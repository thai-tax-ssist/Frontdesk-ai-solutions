import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) return false

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  )
  return res.ok
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  // Uses Resend if configured, falls back to console log
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log(`[followup email] To: ${to} | Subject: ${subject} | Body: ${text}`)
    return true
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'Anna <noreply@frontdeskai.app>',
      to,
      subject,
      text,
    }),
  })
  return res.ok
}

export async function POST(request: NextRequest) {
  try {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { businessId, callLogId, callerNumber, summary, appointmentBooked } = await request.json()

    const supabase = createServiceClient()
    const { data: business } = await supabase
      .from('business_profiles')
      .select(`
        business_name, phone_number,
        follow_up_sms_enabled, follow_up_email_enabled,
        follow_up_sms_template, follow_up_email_template,
        twilio_phone_number
      `)
      .eq('id', businessId)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const vars: Record<string, string> = {
      business_name: business.business_name,
      caller_number: callerNumber,
      summary: summary || 'Your call was handled by our AI receptionist.',
      appointment_status: appointmentBooked ? 'An appointment was scheduled during your call.' : '',
    }

    const results: Record<string, boolean> = {}

    // Send SMS follow-up
    if (business.follow_up_sms_enabled && callerNumber && callerNumber !== 'Unknown') {
      const template = business.follow_up_sms_template ||
        'Hi! Thanks for calling {business_name}. {summary} We look forward to serving you!'
      const smsBody = interpolate(template, vars)
      results.sms = await sendSms(callerNumber, smsBody)

      await supabase
        .from('call_logs')
        .update({ followup_sms_sent: true })
        .eq('id', callLogId)
    }

    // Send email follow-up (if caller left an email, stored in call log)
    if (business.follow_up_email_enabled) {
      const { data: callLog } = await supabase
        .from('call_logs')
        .select('caller_email')
        .eq('id', callLogId)
        .single()

      if (callLog?.caller_email) {
        const template = business.follow_up_email_template ||
          'Thank you for calling {business_name}. Here is a summary of your call:\n\n{summary}'
        const emailBody = interpolate(template, vars)
        results.email = await sendEmail(
          callLog.caller_email,
          `Your call with ${business.business_name}`,
          emailBody
        )

        await supabase
          .from('call_logs')
          .update({ followup_email_sent: true })
          .eq('id', callLogId)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Follow-up error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
