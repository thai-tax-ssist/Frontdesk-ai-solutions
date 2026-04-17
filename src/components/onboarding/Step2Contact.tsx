'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboardingStore } from '@/store/onboarding'

const schema = z.object({
  contact_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z
    .string()
    .min(7, 'Enter a valid phone number')
    .regex(/^[+\d\s\-().]+$/, 'Invalid phone number format'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: () => void
  onBack: () => void
}

export function Step2Contact({ onNext, onBack }: Props) {
  const { formData, updateFormData } = useOnboardingStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name: formData.contact_name || '',
      email: formData.email || '',
      phone_number: formData.phone_number || '',
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
          <User className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Contact information</h2>
          <p className="text-sm text-muted-foreground">
            Your business phone number will be forwarded to FrontDesk AI
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Your full name *</Label>
          <Input
            id="contact_name"
            placeholder="e.g., John Smith"
            {...register('contact_name')}
          />
          {errors.contact_name && (
            <p className="text-xs text-destructive">{errors.contact_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Business email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@mybusiness.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            We&apos;ll send call summaries and notifications to this email
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone_number">Business phone number *</Label>
          <Input
            id="phone_number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            {...register('phone_number')}
          />
          {errors.phone_number && (
            <p className="text-xs text-destructive">{errors.phone_number.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            This is the number your customers call. We&apos;ll set up call forwarding for you.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="gradient">
          Continue
        </Button>
      </div>
    </form>
  )
}
