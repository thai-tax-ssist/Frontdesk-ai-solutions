'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useOnboardingStore } from '@/store/onboarding'
import { BUSINESS_TYPES } from '@/types'
import { TIMEZONES, COUNTRIES } from '@/lib/utils'

const schema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_type: z.string().min(1, 'Please select a business type'),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, 'Please select a country'),
  timezone: z.string().min(1, 'Please select a timezone'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onNext: () => void
}

export function Step1Business({ onNext }: Props) {
  const { formData, updateFormData } = useOnboardingStore()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: formData.business_name || '',
      business_type: formData.business_type || '',
      website: formData.website || '',
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      country: formData.country || 'US',
      timezone: formData.timezone || 'America/New_York',
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
          <Building2 className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Tell us about your business</h2>
          <p className="text-sm text-muted-foreground">This helps us personalize your AI receptionist</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="business_name">Business name *</Label>
            <Input
              id="business_name"
              placeholder="e.g., Smith Family Dental"
              {...register('business_name')}
            />
            {errors.business_name && (
              <p className="text-xs text-destructive">{errors.business_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="business_type">Business type *</Label>
            <Select
              defaultValue={formData.business_type}
              onValueChange={(v) => setValue('business_type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.business_type && (
              <p className="text-xs text-destructive">{errors.business_type.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              placeholder="https://www.mybusiness.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="text-xs text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Street address (optional)</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              {...register('address')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Austin" {...register('city')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input id="state" placeholder="TX" {...register('state')} />
          </div>

          <div className="space-y-1.5">
            <Label>Country *</Label>
            <Select
              defaultValue={formData.country || 'US'}
              onValueChange={(v) => setValue('country', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Timezone *</Label>
            <Select
              defaultValue={formData.timezone || 'America/New_York'}
              onValueChange={(v) => setValue('timezone', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-xs text-destructive">{errors.timezone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" variant="gradient">
          Continue
        </Button>
      </div>
    </form>
  )
}
