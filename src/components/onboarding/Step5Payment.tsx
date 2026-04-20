'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/store/onboarding'
import { PRICING_PLANS } from '@/types'
import { StripePaymentForm } from '@/components/stripe/StripePaymentForm'

interface Props {
  onBack: () => void
}

export function Step5Payment({ onBack }: Props) {
  const router = useRouter()
  const { formData } = useOnboardingStore()

  const [profileReady, setProfileReady] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const selectedPlan = PRICING_PLANS.find((p) => p.id === formData.plan) || PRICING_PLANS[1]
  const price = formData.billing_cycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.price
  const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

  // Save the business profile as soon as this step mounts so it exists
  // in the DB before Stripe creates the customer / SetupIntent.
  useEffect(() => {
    let cancelled = false

    async function saveProfile() {
      setSaveError(null)
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to save business profile')
        }
        if (!cancelled) setProfileReady(true)
      } catch (err) {
        if (!cancelled) setSaveError(err instanceof Error ? err.message : 'Failed to save profile')
      }
    }

    saveProfile()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSuccess = () => {
    router.push('/onboarding?step=complete')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <CreditCard className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Add your payment details</h2>
          <p className="text-sm text-muted-foreground">
            Your card is saved securely — you won&apos;t be charged for 14 days.
          </p>
        </div>
      </div>

      {/* Plan features reminder */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">
          Included in your {selectedPlan.name} trial:
        </p>
        <div className="grid grid-cols-2 gap-1">
          {selectedPlan.features.slice(0, 4).map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Profile save error */}
      {saveError && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{saveError} — <button type="button" className="underline" onClick={() => window.location.reload()}>retry</button></span>
        </div>
      )}

      {/* Payment error from Stripe */}
      {paymentError && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Stripe Elements — only shown once profile is saved */}
      {!profileReady && !saveError && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparing your trial…
        </div>
      )}

      {profileReady && (
        <StripePaymentForm
          priceId={selectedPlan.priceId}
          businessName={formData.business_name}
          planName={selectedPlan.name}
          price={price}
          billingCycle={formData.billing_cycle || 'monthly'}
          trialEndDate={trialEndDate}
          onSuccess={handleSuccess}
          onError={(msg) => {
            setPaymentError(msg)
          }}
        />
      )}

      <div className="flex justify-start pt-2 border-t">
        <Button type="button" variant="ghost" onClick={onBack} size="sm">
          ← Back to plan selection
        </Button>
      </div>
    </div>
  )
}
