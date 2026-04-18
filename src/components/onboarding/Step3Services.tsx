'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/store/onboarding'
import { SERVICES_OPTIONS } from '@/types'
import type { HoursOfOperation } from '@/types'

const schema = z.object({
  services: z.array(z.string()).min(1, 'Select at least one service'),
  greeting_message: z.string().min(10, 'Greeting must be at least 10 characters').max(300),
  after_hours_message: z.string().min(10, 'Message must be at least 10 characters').max(300),
})

type FormData = z.infer<typeof schema>

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<typeof DAYS[number], string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

interface Props {
  onNext: () => void
  onBack: () => void
}

export function Step3Services({ onNext, onBack }: Props) {
  const { formData, updateFormData } = useOnboardingStore()
  const [selectedServices, setSelectedServices] = useState<string[]>(formData.services || [])
  const [hours, setHours] = useState<HoursOfOperation>(
    formData.hours_of_operation || {
      monday: { open: true, from: '09:00', to: '17:00' },
      tuesday: { open: true, from: '09:00', to: '17:00' },
      wednesday: { open: true, from: '09:00', to: '17:00' },
      thursday: { open: true, from: '09:00', to: '17:00' },
      friday: { open: true, from: '09:00', to: '17:00' },
      saturday: { open: false, from: '10:00', to: '14:00' },
      sunday: { open: false, from: '10:00', to: '14:00' },
    }
  )

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      services: formData.services || [],
      greeting_message: formData.greeting_message || `Thank you for calling ${formData.business_name || 'us'}. How can I help you today?`,
      after_hours_message: formData.after_hours_message || `Thank you for calling ${formData.business_name || 'us'}. We are currently closed. Please call back during business hours or leave a message and we'll get back to you.`,
    },
  })

  const toggleService = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service]
    setSelectedServices(updated)
    setValue('services', updated)
  }

  const toggleDay = (day: typeof DAYS[number]) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }))
  }

  const updateHour = (day: typeof DAYS[number], field: 'from' | 'to', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const onSubmit = (data: FormData) => {
    updateFormData({ ...data, hours_of_operation: hours })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <Settings className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Services & AI configuration</h2>
          <p className="text-sm text-muted-foreground">Customize how your AI receptionist handles calls</p>
        </div>
      </div>

      {/* Services Selection */}
      <div className="space-y-3">
        <Label>What should your AI handle? * <span className="font-normal text-muted-foreground">(select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-2">
          {SERVICES_OPTIONS.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={cn(
                'text-left px-3 py-2 rounded-md border text-sm transition-colors',
                selectedServices.includes(service)
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                  : 'border-input hover:border-brand-300 hover:bg-muted'
              )}
            >
              {service}
            </button>
          ))}
        </div>
        {errors.services && (
          <p className="text-xs text-destructive">{errors.services.message}</p>
        )}
      </div>

      {/* Greeting Message */}
      <div className="space-y-1.5">
        <Label htmlFor="greeting_message">AI greeting message *</Label>
        <Textarea
          id="greeting_message"
          rows={3}
          placeholder="Thank you for calling [Business Name]. How can I help you today?"
          {...register('greeting_message')}
        />
        {errors.greeting_message && (
          <p className="text-xs text-destructive">{errors.greeting_message.message}</p>
        )}
        <p className="text-xs text-muted-foreground">This is the first thing callers hear</p>
      </div>

      {/* After Hours Message */}
      <div className="space-y-1.5">
        <Label htmlFor="after_hours_message">After-hours message *</Label>
        <Textarea
          id="after_hours_message"
          rows={3}
          placeholder="Thank you for calling. We're currently closed..."
          {...register('after_hours_message')}
        />
        {errors.after_hours_message && (
          <p className="text-xs text-destructive">{errors.after_hours_message.message}</p>
        )}
      </div>

      {/* Business Hours */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Business hours
        </Label>
        <div className="space-y-2 rounded-lg border p-4">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'w-12 text-xs font-medium rounded py-1 transition-colors',
                  hours[day].open
                    ? 'bg-brand-600 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {DAY_LABELS[day]}
              </button>
              {hours[day].open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    value={hours[day].from}
                    onChange={(e) => updateHour(day, 'from', e.target.value)}
                    className="rounded border border-input px-2 py-1 text-sm"
                  />
                  <span className="text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={hours[day].to}
                    onChange={(e) => updateHour(day, 'to', e.target.value)}
                    className="rounded border border-input px-2 py-1 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" variant="gradient">Continue</Button>
      </div>
    </form>
  )
}
