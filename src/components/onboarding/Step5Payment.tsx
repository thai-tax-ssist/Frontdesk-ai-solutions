'use client'

import { useState } from 'react'
import { CreditCard, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnboardingStore } from '@/store/onboarding'
import { PRICING_PLANS } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  onBack: () => void
}

export function Step5Payment({ onBack }: Props) {
  const { formData } = useOnboardingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPlan = PRICING_PLANS.find((p) => p.id === formData.plan) || PRICING_PLANS[1]
  const price = formData.billing_cycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price
  const priceId = selectedPlan.priceId

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Save business profile before redirecting to Stripe
      const saveResponse = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save business profile')
      }

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          businessName: formData.business_name,
        }),
      })

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await checkoutResponse.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <CreditCard className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Start your free trial</h2>
          <p className="text-sm text-muted-foreground">
            14 days free — no charge until your trial ends
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <h3 className="font-semibold text-sm">Order summary</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{selectedPlan.name} Plan</div>
            <div className="text-sm text-muted-foreground capitalize">
              Billed {formData.billing_cycle || 'monthly'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(price)}/mo</div>
            {formData.billing_cycle === 'yearly' && (
              <div className="text-xs text-green-600">
                Save {formatCurrency((selectedPlan.price - price) * 12)}/year
              </div>
            )}
          </div>
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Due today</span>
            <span className="font-bold text-lg text-green-600">$0.00</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            First charge on{' '}
            {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* What's included */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">What&apos;s included in your trial:</h3>
        {selectedPlan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-brand-500 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 text-green-500" />
        <span>Secured by Stripe · 256-bit SSL encryption · Cancel anytime</span>
      </div>

      <Button
        type="button"
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        loading={isLoading}
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Start 14-day free trial
      </Button>

      <div className="flex justify-start pt-2 border-t">
        <Button type="button" variant="ghost" onClick={onBack} size="sm">
          ← Back to plan selection
        </Button>
      </div>
    </div>
  )
}
