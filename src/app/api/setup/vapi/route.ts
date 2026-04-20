import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const VAPI_BASE = 'https://api.vapi.ai'

function buildAssistantConfig(business: {
  business_name: string
  business_type: string
  greeting_message: string | null
  after_hours_message: string | null
  services: string[]
  timezone: string
  hours_of_operation: Record<string, unknown>
}) {
  const greeting = business.greeting_message ||
    `Thank you for calling ${business.business_name}. How can I help you today?`
  const afterHours = business.after_hours_message ||
    `Thank you for calling ${business.business_name}. We are currently closed. Please call back during business hours.`
  const servicesList = business.services?.join(', ') || 'general inquiries'

  return {
    name: `Anna — ${business.business_name}`,
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      systemPrompt: `You are Anna, a professional AI receptionist for ${business.business_name}, a ${business.business_type}.

Your role is to assist callers professionally and efficiently.

GREETING: ${greeting}

SERVICES YOU HANDLE: ${servicesList}

AFTER HOURS: ${afterHours}

GUIDELINES:
- Always be warm, professional, and helpful
- Collect caller's name and reason for calling at the start
- Book appointments when requested — ask for preferred date/time
- Take messages accurately with name, number, and reason
- For emergencies, advise the caller to call emergency services
- Never invent information you don't know — say you'll have someone follow up
- Keep calls concise and focused
- Thank the caller by name when ending the call`,
      temperature: 0.7,
    },
    voice: {
      provider: 'deepgram',
      voiceId: 'luna',
    },
    firstMessage: greeting,
    endCallMessage: `Thank you for calling ${business.business_name}. Have a great day!`,
    recordingEnabled: true,
    transcriptionsEnabled: true,
    metadata: {
      business_name: business.business_name,
      business_type: business.business_type,
      timezone: business.timezone,
    },
  }
}

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
      .select('*')
      .eq('id', businessId)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const apiKey = process.env.VAPI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'VAPI_API_KEY not configured' }, { status: 500 })
    }

    const config = buildAssistantConfig(business)

    let assistantId = business.vapi_assistant_id
    let response: Response

    if (assistantId) {
      response = await fetch(`${VAPI_BASE}/assistant/${assistantId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
    } else {
      response = await fetch(`${VAPI_BASE}/assistant`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
    }

    if (!response.ok) {
      const err = await response.text()
      console.error('Vapi error:', err)
      return NextResponse.json({ error: 'Vapi API error', details: err }, { status: 502 })
    }

    const assistant = await response.json()
    assistantId = assistant.id

    await supabase
      .from('business_profiles')
      .update({ vapi_assistant_id: assistantId })
      .eq('id', businessId)

    return NextResponse.json({ assistantId })
  } catch (error) {
    console.error('Vapi setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
