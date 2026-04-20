import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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
      .select('id, twilio_phone_number, country, vapi_assistant_id')
      .eq('id', businessId)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (business.twilio_phone_number) {
      return NextResponse.json({ phoneNumber: business.twilio_phone_number, skipped: true })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 })
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    // Map country to Twilio ISO country code
    const countryCode = business.country === 'GB' ? 'GB'
      : business.country === 'AU' ? 'AU'
      : business.country === 'CA' ? 'CA'
      : business.country === 'DE' ? 'DE'
      : business.country === 'FR' ? 'FR'
      : 'US'

    // Search for available numbers
    const searchRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${countryCode}/Local.json?VoiceEnabled=true&SmsEnabled=true&Limit=1`,
      { headers: { Authorization: `Basic ${credentials}` } }
    )

    if (!searchRes.ok) {
      const err = await searchRes.text()
      console.error('Twilio search error:', err)
      return NextResponse.json({ error: 'Could not search Twilio numbers', details: err }, { status: 502 })
    }

    const searchData = await searchRes.json()
    const available = searchData.available_phone_numbers?.[0]

    if (!available) {
      return NextResponse.json({ error: 'No available phone numbers' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Purchase the number
    const purchaseBody = new URLSearchParams({
      PhoneNumber: available.phone_number,
      VoiceUrl: `${appUrl}/api/vapi/webhook`,
      VoiceMethod: 'POST',
      StatusCallback: `${appUrl}/api/vapi/webhook`,
      SmsUrl: `${appUrl}/api/vapi/webhook`,
    })

    const purchaseRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: purchaseBody.toString(),
      }
    )

    if (!purchaseRes.ok) {
      const err = await purchaseRes.text()
      console.error('Twilio purchase error:', err)
      return NextResponse.json({ error: 'Could not purchase phone number', details: err }, { status: 502 })
    }

    const purchased = await purchaseRes.json()
    const phoneNumber = purchased.phone_number

    await supabase
      .from('business_profiles')
      .update({
        twilio_phone_number: phoneNumber,
        twilio_number_sid: purchased.sid,
      })
      .eq('id', businessId)

    return NextResponse.json({ phoneNumber, sid: purchased.sid })
  } catch (error) {
    console.error('Twilio setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
