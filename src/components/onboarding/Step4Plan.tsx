'use client'

import { useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/store/onboarding'
import { PRICING_PLANS } from '@/types'
import type { SubscriptionPlan } from '@/types'

interface Props {
  onNext: () => void
  onBack: () => void
}

export function Step4Plan({ onNext, onBack }: Props) {
  const { formData, updateFormData } = useOnboardingStore()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(formData.plan || 'professional')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(formData.billing_cycle || 'monthly')

  const handleNext = () => {
    updateFormData({ plan: selectedPlan, billing_cycle: billingCycle })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <Zap className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Choose your plan</h2>
          <p className="text-sm text-muted-foreground">Start with a 14-day free trial on any plan</p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'text-sm font-medium transition-colors',
            billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            billingCycle === 'yearly' ? 'bg-brand-600' : 'bg-muted'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            'flex items-center gap-1.5 text-sm font-medium transition-colors',
            billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          Yearly
          <Badge variant="success" className="text-xs">Save 15%</Badge>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4">
        {PRICING_PLANS.map((plan) => {
          const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price
          const isSelected = selectedPlan === plan.id

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'relative w-full text-left rounded-lg border-2 p-4 transition-all',
                isSelected
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-input hover:border-brand-300'
              )}
            >
              {plan.popular && (
                <Badge className="absolute top-3 right-3 bg-brand-600 text-white text-xs">
                  Most Popular
                </Badge>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected ? 'border-brand-600 bg-brand-600' : 'border-muted-foreground'
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold">€{price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </div>

              <div className="mt-3 ml-8 grid grid-cols-2 gap-1">
                {plan.features.slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-brand-500 shrink-0" />
                    {feature}
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <div className="text-xs text-brand-600 font-medium">
                    +{plan.features.length - 4} more features
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        14-day free trial included · Cancel anytime · No setup fees
      </p>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" variant="gradient" onClick={handleNext}>
          Continue to payment
        </Button>
      </div>
    </div>
  )
}
