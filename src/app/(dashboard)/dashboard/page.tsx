import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhoneCall, TrendingUp, Calendar, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: business } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Redirect to onboarding if no business profile yet
  if (!business) {
    redirect('/onboarding')
  }

  // Fetch recent call logs
  const { data: recentCalls } = await supabase
    .from('call_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch call stats for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: totalCallsThisMonth } = await supabase
    .from('call_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const { count: appointmentsBooked } = await supabase
    .from('call_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('appointment_booked', true)
    .gte('created_at', startOfMonth.toISOString())

  const isTrialing = business.subscription_status === 'trialing'
  const isActive = business.subscription_status === 'active'
  const needsOnboarding = !business.onboarding_completed

  const STATS = [
    {
      label: 'Calls this month',
      value: totalCallsThisMonth ?? 0,
      icon: PhoneCall,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      label: 'Appointments booked',
      value: appointmentsBooked ?? 0,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Avg call duration',
      value: '2m 34s',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Conversion rate',
      value: totalCallsThisMonth ? `${Math.round(((appointmentsBooked ?? 0) / totalCallsThisMonth) * 100)}%` : '—',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 mt-14 lg:mt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{business.contact_name ? `, ${business.contact_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {business.business_name} · {formatDate(new Date().toISOString())}
          </p>
        </div>
        <Badge
          variant={isActive ? 'success' : isTrialing ? 'secondary' : 'warning'}
          className="capitalize"
        >
          {business.subscription_status}
        </Badge>
      </div>

      {/* Setup Banner (if not completed) */}
      {needsOnboarding && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-brand-900">Complete your setup</div>
              <div className="text-sm text-brand-700">
                Your AI receptionist is almost ready. Finish setting up to start taking calls.
              </div>
            </div>
          </div>
          <Button variant="gradient" size="sm" asChild>
            <Link href="/onboarding">
              Complete setup <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Trial Banner */}
      {isTrialing && business.current_period_end && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-yellow-900">Free trial active</div>
            <div className="text-sm text-yellow-700">
              Your trial ends on {formatDate(business.current_period_end)}. Add payment to keep your service.
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/billing">Manage billing</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Calls */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent calls</CardTitle>
              <CardDescription>Last 5 calls handled by your AI</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/calls">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentCalls && recentCalls.length > 0 ? (
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <PhoneCall className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{call.caller_number || 'Unknown caller'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(call.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {call.appointment_booked && (
                        <Badge variant="success" className="text-xs">Booked</Badge>
                      )}
                      <Badge
                        variant={call.status === 'completed' ? 'secondary' : 'warning'}
                        className="text-xs capitalize"
                      >
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <PhoneCall className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="font-medium text-sm">No calls yet</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Calls will appear here once your AI receptionist is active
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'View call analytics', href: '/dashboard/analytics', icon: TrendingUp },
              { label: 'Update AI settings', href: '/settings', icon: PhoneCall },
              { label: 'Manage billing', href: '/billing', icon: Calendar },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Receptionist Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI Receptionist Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`h-3 w-3 rounded-full ${isActive || isTrialing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <div>
                <div className="text-sm font-medium">
                  {isActive || isTrialing ? 'Online & Answering' : 'Inactive'}
                </div>
                <div className="text-xs text-muted-foreground">Current status</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <PhoneCall className="h-4 w-4 text-brand-600" />
              <div>
                <div className="text-sm font-medium capitalize">{business.plan} Plan</div>
                <div className="text-xs text-muted-foreground">
                  {business.plan === 'starter' ? '200' : business.plan === 'professional' ? '600' : 'Unlimited'} calls/mo
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">
                  {business.vapi_assistant_id ? 'Configured' : 'Pending setup'}
                </div>
                <div className="text-xs text-muted-foreground">AI assistant</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
