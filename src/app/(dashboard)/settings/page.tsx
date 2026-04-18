'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Save, Phone, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BUSINESS_TYPES, SERVICES_OPTIONS } from '@/types'
import { cn } from '@/lib/utils'

const schema = z.object({
  business_name: z.string().min(2, 'Required'),
  business_type: z.string().min(1, 'Required'),
  phone_number: z.string().min(7, 'Required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  greeting_message: z.string().min(10, 'Too short').max(300),
  after_hours_message: z.string().min(10, 'Too short').max(300),
})

type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: business } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (business) {
        reset({
          business_name: business.business_name,
          business_type: business.business_type,
          phone_number: business.phone_number,
          website: business.website || '',
          greeting_message: business.greeting_message || '',
          after_hours_message: business.after_hours_message || '',
        })
        setSelectedServices(business.services || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('business_profiles')
      .update({ ...data, services: selectedServices })
      .eq('user_id', user.id)

    setSaving(false)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 mt-14 lg:mt-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 mt-14 lg:mt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your business and AI configuration</p>
        </div>
        {savedMsg && (
          <div className="text-sm text-green-600 font-medium flex items-center gap-1">
            <Save className="h-4 w-4" /> Saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base">Business information</CardTitle>
            </div>
            <CardDescription>Basic details about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Business name</Label>
                <Input {...register('business_name')} />
                {errors.business_name && <p className="text-xs text-destructive">{errors.business_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Business type</Label>
                <Select onValueChange={(v) => setValue('business_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.business_type && <p className="text-xs text-destructive">{errors.business_type.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Business phone</Label>
                <Input {...register('phone_number')} />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Website (optional)</Label>
                <Input {...register('website')} placeholder="https://" />
                {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base">AI receptionist configuration</CardTitle>
            </div>
            <CardDescription>Customize how your AI handles calls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Greeting message</Label>
              <Textarea rows={3} {...register('greeting_message')} />
              {errors.greeting_message && <p className="text-xs text-destructive">{errors.greeting_message.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>After-hours message</Label>
              <Textarea rows={3} {...register('after_hours_message')} />
              {errors.after_hours_message && <p className="text-xs text-destructive">{errors.after_hours_message.message}</p>}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Services handled by AI</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES_OPTIONS.map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => toggleService(s)}
                    className={cn(
                      'text-left px-3 py-2 rounded-md border text-sm transition-colors',
                      selectedServices.includes(s)
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                        : 'border-input hover:border-brand-300 hover:bg-muted'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="gradient" loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
