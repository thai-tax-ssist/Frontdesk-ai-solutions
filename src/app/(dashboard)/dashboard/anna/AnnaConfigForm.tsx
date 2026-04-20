'use client'

import { useState } from 'react'
import { Bot, Mic, Globe, Zap, MessageSquare, Clock, Phone, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SERVICES_OPTIONS } from '@/types'

const VOICES = [
  { id: 'luna', label: 'Luna', description: 'Warm & professional (female)' },
  { id: 'stella', label: 'Stella', description: 'Bright & energetic (female)' },
  { id: 'nova', label: 'Nova', description: 'Calm & confident (female)' },
  { id: 'orion', label: 'Orion', description: 'Deep & authoritative (male)' },
  { id: 'atlas', label: 'Atlas', description: 'Friendly & approachable (male)' },
]

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'nl', label: 'Dutch' },
  { id: 'de', label: 'German' },
  { id: 'fr', label: 'French' },
  { id: 'es', label: 'Spanish' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
]

const PERSONALITIES = [
  { id: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { id: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { id: 'empathetic', label: 'Empathetic', description: 'Caring and understanding' },
]

interface Props {
  business: Record<string, unknown>
}

export function AnnaConfigForm({ business }: Props) {
  const [greeting, setGreeting] = useState(
    (business.greeting_message as string) ||
    `Thank you for calling ${business.business_name}. How can I help you today?`
  )
  const [afterHours, setAfterHours] = useState(
    (business.after_hours_message as string) ||
    `Thank you for calling ${business.business_name}. We are currently closed. Please call back during business hours.`
  )
  const [voice, setVoice] = useState((business.anna_voice as string) || 'luna')
  const [language, setLanguage] = useState((business.anna_language as string) || 'en')
  const [personality, setPersonality] = useState((business.anna_personality as string) || 'professional')
  const [services, setServices] = useState<string[]>((business.services as string[]) || [])
  const [followUpSms, setFollowUpSms] = useState((business.follow_up_sms_enabled as boolean) || false)
  const [followUpEmail, setFollowUpEmail] = useState((business.follow_up_email_enabled as boolean) || false)
  const [smsTemplate, setSmsTemplate] = useState(
    (business.follow_up_sms_template as string) ||
    'Hi, thanks for calling {business_name}! {summary} Reply STOP to opt out.'
  )
  const [emailTemplate, setEmailTemplate] = useState(
    (business.follow_up_email_template as string) ||
    'Thank you for calling {business_name}. Here is a summary of your call: {summary}'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleService = (svc: string) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/anna/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          greeting_message: greeting,
          after_hours_message: afterHours,
          anna_voice: voice,
          anna_language: language,
          anna_personality: personality,
          services,
          follow_up_sms_enabled: followUpSms,
          follow_up_email_enabled: followUpEmail,
          follow_up_sms_template: smsTemplate,
          follow_up_email_template: emailTemplate,
        }),
      })

      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasAssistant = !!(business.vapi_assistant_id as string)
  const phoneNumber = business.twilio_phone_number as string | null

  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={cn('h-3 w-3 rounded-full', hasAssistant ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
              <div>
                <div className="text-sm font-medium">{hasAssistant ? 'Anna is live' : 'Setup pending'}</div>
                <div className="text-xs text-muted-foreground">AI assistant status</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-brand-600" />
              <div>
                <div className="text-sm font-medium">{phoneNumber || 'Not assigned'}</div>
                <div className="text-xs text-muted-foreground">Business phone number</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bot className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium capitalize">{personality}</div>
                <div className="text-xs text-muted-foreground">Current personality</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice & Language */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base">Voice & Language</CardTitle>
          </div>
          <CardDescription>Choose how Anna sounds to your callers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="mb-2 block">Voice</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                    voice === v.id ? 'border-brand-500 bg-brand-50' : 'border-input hover:border-brand-300'
                  )}
                >
                  <div className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                    voice === v.id ? 'border-brand-600 bg-brand-600' : 'border-muted-foreground'
                  )}>
                    {voice === v.id && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{v.label}</div>
                    <div className="text-xs text-muted-foreground">{v.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Primary Language</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-all',
                    language === l.id
                      ? 'border-brand-500 bg-brand-100 text-brand-700 font-medium'
                      : 'border-input text-muted-foreground hover:border-brand-300'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base">Personality</CardTitle>
          </div>
          <CardDescription>Set the tone of Anna's conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PERSONALITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonality(p.id)}
                className={cn(
                  'rounded-lg border-2 p-3 text-left transition-all',
                  personality === p.id ? 'border-brand-500 bg-brand-50' : 'border-input hover:border-brand-300'
                )}
              >
                <div className="text-sm font-medium capitalize">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Greeting Scripts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base">Call Scripts</CardTitle>
          </div>
          <CardDescription>
            Use {'{business_name}'} as a placeholder for your business name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="greeting">Opening Greeting</Label>
            <Textarea
              id="greeting"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              placeholder="Thank you for calling…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="afterHours">After-Hours Message</Label>
            <Textarea
              id="afterHours"
              value={afterHours}
              onChange={(e) => setAfterHours(e.target.value)}
              rows={3}
              placeholder="Thank you for calling. We are currently closed…"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Services Anna Handles</CardTitle>
          <CardDescription>Select what Anna should assist callers with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {SERVICES_OPTIONS.map((svc) => (
              <button
                key={svc}
                type="button"
                onClick={() => toggleService(svc)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                  services.includes(svc)
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                    : 'border-input text-muted-foreground hover:border-brand-300'
                )}
              >
                <Check className={cn('h-3.5 w-3.5 shrink-0', services.includes(svc) ? 'opacity-100' : 'opacity-0')} />
                {svc}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Follow-up */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base">Automatic Follow-ups</CardTitle>
          </div>
          <CardDescription>
            Send automatic messages after each call. Use {'{summary}'}, {'{business_name}'}, {'{caller_number}'} as placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">SMS Follow-up</div>
              <div className="text-xs text-muted-foreground">Send a text to the caller after the call ends</div>
            </div>
            <button
              type="button"
              onClick={() => setFollowUpSms(!followUpSms)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                followUpSms ? 'bg-brand-600' : 'bg-muted'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                followUpSms ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          {followUpSms && (
            <div className="space-y-1.5">
              <Label>SMS Template</Label>
              <Textarea
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                rows={2}
                placeholder="Hi, thanks for calling {business_name}…"
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Email Follow-up</div>
              <div className="text-xs text-muted-foreground">Send an email summary after the call ends</div>
            </div>
            <button
              type="button"
              onClick={() => setFollowUpEmail(!followUpEmail)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                followUpEmail ? 'bg-brand-600' : 'bg-muted'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                followUpEmail ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          {followUpEmail && (
            <div className="space-y-1.5">
              <Label>Email Template</Label>
              <Textarea
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={3}
                placeholder="Thank you for calling {business_name}…"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Saved & synced to Anna
          </div>
        )}
        <div className="ml-auto">
          <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            ) : (
              'Save Anna configuration'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
