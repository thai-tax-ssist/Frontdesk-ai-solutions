import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OnboardingFormData, OnboardingStep } from '@/types'

interface OnboardingStore {
  currentStep: OnboardingStep
  formData: Partial<OnboardingFormData>
  setStep: (step: OnboardingStep) => void
  updateFormData: (data: Partial<OnboardingFormData>) => void
  reset: () => void
}

const defaultFormData: Partial<OnboardingFormData> = {
  country: 'US',
  timezone: 'America/New_York',
  billing_cycle: 'monthly',
  plan: 'professional',
  services: [],
  hours_of_operation: {
    monday: { open: true, from: '09:00', to: '17:00' },
    tuesday: { open: true, from: '09:00', to: '17:00' },
    wednesday: { open: true, from: '09:00', to: '17:00' },
    thursday: { open: true, from: '09:00', to: '17:00' },
    friday: { open: true, from: '09:00', to: '17:00' },
    saturday: { open: false, from: '10:00', to: '14:00' },
    sunday: { open: false, from: '10:00', to: '14:00' },
  },
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 'business',
      formData: defaultFormData,
      setStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      reset: () => set({ currentStep: 'business', formData: defaultFormData }),
    }),
    { name: 'frontdesk-onboarding' }
  )
)

export const ONBOARDING_STEPS: { id: OnboardingStep; label: string }[] = [
  { id: 'business', label: 'Business Info' },
  { id: 'contact', label: 'Contact' },
  { id: 'services', label: 'Services' },
  { id: 'plan', label: 'Choose Plan' },
  { id: 'payment', label: 'Payment' },
]
