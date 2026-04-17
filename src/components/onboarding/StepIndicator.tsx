import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from '@/types'
import { ONBOARDING_STEPS } from '@/store/onboarding'

interface StepIndicatorProps {
  currentStep: OnboardingStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-center gap-0">
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isCompleted && 'bg-brand-600 text-white',
                  isCurrent && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={cn(
                'text-xs hidden sm:block',
                (isCompleted || isCurrent) ? 'text-brand-600 font-medium' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 w-8 sm:w-12 mx-1 sm:mx-2 mb-4 transition-colors',
                isCompleted ? 'bg-brand-600' : 'bg-muted'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
