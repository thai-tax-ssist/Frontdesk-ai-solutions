import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ONE-TIME USE — delete immediately after calling
const TARGET_EMAIL = 'shalongthaifood@gmail.com'
const NEW_PASSWORD = 'FrontDesk2026!'

export async function GET() {
  const serviceClient = createServiceClient()

  const { data: { users }, error: listError } = await serviceClient.auth.admin.listUsers()
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  const user = users.find((u) => u.email === TARGET_EMAIL)
  if (!user) return NextResponse.json({ error: `User not found: ${TARGET_EMAIL}` }, { status: 404 })

  const { error: updateError } = await serviceClient.auth.admin.updateUserById(user.id, {
    password: NEW_PASSWORD,
  })
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, updated: TARGET_EMAIL })
}
