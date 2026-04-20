'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CONSENT_KEY = 'frontdesk_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      // Slight delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = (all: boolean) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: all,
      marketing: all,
      timestamp: new Date().toISOString(),
    }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl">
      <div className="rounded-xl border bg-background shadow-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-brand-600 shrink-0" />
            <span className="font-semibold text-sm">We use cookies</span>
          </div>
          <button
            type="button"
            onClick={() => accept(false)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          We use essential cookies to make our site work. With your consent, we may also use analytics
          cookies to improve your experience. Read our{' '}
          <a href="/privacy" className="text-brand-600 underline hover:no-underline">Privacy Policy</a>.
        </p>

        {showDetails && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium">Essential cookies</span>
              <span className="text-green-600 font-medium">Always active</span>
            </div>
            <p className="text-muted-foreground">Required for authentication, session management, and security.</p>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="font-medium">Analytics cookies</span>
              <span className="text-muted-foreground">Optional</span>
            </div>
            <p className="text-muted-foreground">Help us understand how visitors use our site to improve it.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => accept(false)}>
            Necessary only
          </Button>
          <Button variant="gradient" size="sm" onClick={() => accept(true)}>
            Accept all
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground underline hover:no-underline ml-auto"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide details' : 'Manage preferences'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 text-green-500" />
          GDPR compliant · We never sell your data
        </div>
      </div>
    </div>
  )
}
