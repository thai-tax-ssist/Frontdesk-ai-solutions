import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// One-time admin route — delete after use
export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Find user by email
  const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const user = users.find((u) => u.email === email)
  if (!user) return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 })

  // Update password
  const { error: updateError } = await serviceClient.auth.admin.updateUserById(user.id, { password })
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, message: `Password updated for ${email}` })
}
