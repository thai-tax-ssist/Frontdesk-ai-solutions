'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PhoneCall, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { Step1Business } from '@/components/onboarding/Step1Business'
import { Step2Contact } from '@/components/onboarding/Step2Contact'
import { Step3Services } from '@/components/onboarding/Step3Services'
import { Step4Plan } from '@/components/onboarding/Step4Plan'
import { Step5Payment } from '@/components/onboarding/Step5Payment'
import { useOnboardingStore, ONBOARDING_STEPS } from '@/store/onboarding'
import type { OnboardingStep } from '@/types'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentStep, setStep, reset } = useOnboardingStore()

  const stepParam = searchParams.get('step') as OnboardingStep | 'complete' | null

  useEffect(() => {
    if (stepParam === 'complete') return
    if (stepParam && ONBOARDING_STEPS.some((s) => s.id === stepParam)) {
      setStep(stepParam as OnboardingStep)
    }
  }, [stepParam, setStep])

  const goToStep = (step: OnboardingStep) => {
    setStep(step)
    router.push(`/onboarding?step=${step}`, { scroll: false })
  }

  const goNext = () => {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)
    if (idx < ONBOARDING_STEPS.length - 1) {
      goToStep(ONBOARDING_STEPS[idx + 1].id)
    }
  }

  const goBack = () => {
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)
    if (idx > 0) {
      goToStep(ONBOARDING_STEPS[idx - 1].id)
    }
  }

  if (stepParam === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">You&apos;re all set! 🎉</h1>
            <p className="text-muted-foreground">
              Welcome to FrontDesk AI. Your AI receptionist is being configured and will be ready within a few minutes.
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-left space-y-2">
            <div className="font-medium">What happens next:</div>
            <div className="text-muted-foreground space-y-1">
              <p>✅ Your business profile has been saved</p>
              <p>✅ Your subscription is active</p>
              <p>⏳ AI receptionist setup (5-10 min)</p>
              <p>⏳ We&apos;ll email you call forwarding instructions</p>
            </div>
          </div>
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={() => { reset(); router.push('/dashboard') }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <PhoneCall className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">FrontDesk AI</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Step {ONBOARDING_STEPS.findIndex((s) => s.id === currentStep) + 1} of {ONBOARDING_STEPS.length}
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="bg-background rounded-xl border shadow-sm p-6 md:p-8">
          {currentStep === 'business' && (
            <Step1Business onNext={goNext} />
          )}
          {currentStep === 'contact' && (
            <Step2Contact onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'services' && (
            <Step3Services onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'plan' && (
            <Step4Plan onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 'payment' && (
            <Step5Payment onBack={goBack} />
          )}
        </div>
      </div>
    </div>
  )
}
