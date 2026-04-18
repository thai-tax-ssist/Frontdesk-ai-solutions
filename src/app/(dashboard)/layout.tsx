import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: business } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Redirect new users to onboarding (unless already on onboarding page)
  if (!business && typeof window === 'undefined') {
    // Server-side check handled by middleware
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardNav user={user} business={business} />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
