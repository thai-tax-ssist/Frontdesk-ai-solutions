import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhoneCall, PhoneIncoming, PhoneMissed, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }> = {
  completed: { label: 'Completed', variant: 'success' },
  missed: { label: 'Missed', variant: 'destructive' },
  voicemail: { label: 'Voicemail', variant: 'warning' },
  transferred: { label: 'Transferred', variant: 'secondary' },
}

export default async function CallLogsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: calls } = await supabase
    .from('call_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalCalls = calls?.length ?? 0
  const missedCalls = calls?.filter((c) => c.status === 'missed').length ?? 0
  const bookedCalls = calls?.filter((c) => c.appointment_booked).length ?? 0

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 mt-14 lg:mt-0">
      <div>
        <h1 className="text-2xl font-bold">Call Logs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">All calls handled by your AI receptionist</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total calls', value: totalCalls, icon: PhoneCall, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Missed calls', value: missedCalls, icon: PhoneMissed, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Appointments booked', value: bookedCalls, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} mb-3`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {calls && calls.length > 0 ? (
            <div className="space-y-0 divide-y">
              {calls.map((call) => {
                const statusCfg = STATUS_CONFIG[call.status] || { label: call.status, variant: 'secondary' as const }
                return (
                  <div key={call.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{call.caller_number || 'Unknown caller'}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {call.summary || 'No summary available'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {call.duration_seconds > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                        </span>
                      )}
                      {call.appointment_booked && (
                        <Badge variant="success" className="text-xs">Booked</Badge>
                      )}
                      <Badge variant={statusCfg.variant} className="text-xs">
                        {statusCfg.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(call.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <PhoneCall className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="font-medium">No calls yet</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-xs">
                Once your AI receptionist is active, all handled calls will appear here.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
