import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, PhoneCall, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    { count: callsThisMonth },
    { count: callsLastMonth },
    { count: bookedThisMonth },
    { count: totalCalls },
  ] = await Promise.all([
    supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfMonth),
    supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('appointment_booked', true).gte('created_at', startOfMonth),
    supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const callGrowth = callsLastMonth && callsLastMonth > 0
    ? Math.round(((( callsThisMonth ?? 0) - callsLastMonth) / callsLastMonth) * 100)
    : 0

  const conversionRate = callsThisMonth && callsThisMonth > 0
    ? Math.round(((bookedThisMonth ?? 0) / callsThisMonth) * 100)
    : 0

  const METRICS = [
    {
      label: 'Calls this month',
      value: callsThisMonth ?? 0,
      subtext: callGrowth >= 0 ? `+${callGrowth}% vs last month` : `${callGrowth}% vs last month`,
      icon: PhoneCall,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Appointments booked',
      value: bookedThisMonth ?? 0,
      subtext: `${conversionRate}% conversion rate`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total calls handled',
      value: totalCalls ?? 0,
      subtext: 'All time',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Customer satisfaction',
      value: '98%',
      subtext: 'Based on call sentiment',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 mt-14 lg:mt-0">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Performance insights for your AI receptionist
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${m.bg} mb-3`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
              <div className="text-xs text-brand-600 font-medium mt-1">{m.subtext}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Call Volume — Coming Soon</CardTitle>
          <CardDescription>
            Interactive call volume charts will be available once you start receiving calls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 rounded-lg bg-muted/50 border-2 border-dashed">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm text-muted-foreground">Charts will appear once call data is available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
