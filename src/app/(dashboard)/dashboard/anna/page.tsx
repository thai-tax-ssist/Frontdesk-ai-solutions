import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnnaConfigForm } from './AnnaConfigForm'

export const dynamic = 'force-dynamic'

export default async function AnnaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: business } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  return (
    <div className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Anna AI Receptionist</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure how Anna sounds, speaks, and responds to your callers.
          </p>
        </div>
        <AnnaConfigForm business={business} />
      </div>
    </div>
  )
}
