'use client'

import { useEffect, useState } from 'react'
import { CreditCard, ExternalLink, Check, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PRICING_PLANS } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BusinessProfile } from '@/types'

export default function BillingPage() {
  const [supabase] = useState(() => createClient())
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setBusiness(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, businessName: business?.business_name }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-40 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  const currentPlan = PRICING_PLANS.find((p) => p.id === business?.plan) || PRICING_PLANS[0]
  const isActive = business?.subscription_status === 'active'
  const isTrialing = business?.subscription_status === 'trialing'
  const hasSubscription = !!business?.stripe_subscription_id

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 mt-14 lg:mt-0">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your subscription and payment details</p>
      </div>

      {/* Current Plan */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base">Current plan</CardTitle>
            </div>
            <Badge
              variant={isActive ? 'success' : isTrialing ? 'secondary' : 'warning'}
              className="capitalize"
            >
              {business?.subscription_status || 'inactive'}
            </Badge>
          </div>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold capitalize">{currentPlan.name} Plan</div>
              <div className="text-sm text-muted-foreground">{currentPlan.description}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(currentPlan.price)}</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          {business?.current_period_end && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              {isTrialing
                ? `Trial ends: ${formatDate(business.current_period_end)}`
                : `Next billing date: ${formatDate(business.current_period_end)}`}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">Plan features</div>
            <div className="grid grid-cols-2 gap-1.5">
              {currentPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {hasSubscription && (
            <Button
              onClick={handleManageBilling}
              loading={portalLoading}
              className="w-full"
              variant="outline"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage billing & payment methods
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {business?.plan !== 'enterprise' && (
        <div>
          <h2 className="text-base font-semibold mb-4">Upgrade your plan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PRICING_PLANS.filter((p) => {
              const order = ['starter', 'professional', 'enterprise']
              return order.indexOf(p.id) > order.indexOf(business?.plan || 'starter')
            }).map((plan) => (
              <Card
                key={plan.id}
                className={`border-0 shadow-sm ${plan.popular ? 'ring-2 ring-brand-500' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge className="bg-brand-600 text-white text-xs">Recommended</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-sm">
                        <Check className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    onClick={() => handleUpgrade(plan.priceId)}
                  >
                    Upgrade to {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
