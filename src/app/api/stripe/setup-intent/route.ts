import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrRetrieveCustomer, createSetupIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessName } = await request.json()

    const customerId = await createOrRetrieveCustomer({
      userId: user.id,
      email: user.email!,
      businessName: businessName || 'My Business',
    })

    const setupIntent = await createSetupIntent(customerId)

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    })
  } catch (error) {
    console.error('SetupIntent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
