'use client'

import { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Shield, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  priceId: string
  businessName: string
  planName: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  trialEndDate: Date
  onSuccess: () => void
  onError: (msg: string) => void
}

function CheckoutForm({
  priceId,
  businessName,
  planName,
  price,
  billingCycle,
  trialEndDate,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      onError(submitError.message || 'Card validation failed')
      setIsSubmitting(false)
      return
    }

    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Payment setup failed')
      setIsSubmitting(false)
      return
    }

    if (setupIntent?.payment_method) {
      try {
        const res = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            paymentMethodId: setupIntent.payment_method,
            businessName,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Subscription creation failed')
        }

        onSuccess()
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Something went wrong')
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { name: 'auto' } },
        }}
      />

      <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium">{planName} — €{price}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Billing</span>
          <span className="font-medium capitalize">{billingCycle}</span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1">
          <span className="text-muted-foreground font-medium">Due today</span>
          <span className="font-bold text-green-600">€0.00</span>
        </div>
        <p className="text-xs text-muted-foreground">
          First charge on {trialEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
        Secured by Stripe · 256-bit SSL · Cancel anytime before trial ends
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up your trial…
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Start 14-day free trial
          </>
        )}
      </Button>
    </form>
  )
}

export function StripePaymentForm(props: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stripe/setup-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName: props.businessName }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setInitError(data.error || 'Could not initialize payment')
        }
      })
      .catch(() => setInitError('Could not connect to payment service'))
      .finally(() => setLoading(false))
  }, [props.businessName])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (initError || !clientSecret) {
    return (
      <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
        {initError || 'Payment setup unavailable. Please try again.'}
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: { colorPrimary: '#6366f1', borderRadius: '8px' },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  )
}
