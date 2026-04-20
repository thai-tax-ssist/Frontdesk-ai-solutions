'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  PhoneCall, LayoutDashboard, Settings, CreditCard,
  LogOut, Menu, X, BarChart3, Bot
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { BusinessProfile } from '@/types'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/calls', icon: PhoneCall, label: 'Call Logs' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/anna', icon: Bot, label: 'Anna AI' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
]

interface Props {
  user: SupabaseUser
  business: BusinessProfile | null
}

export function DashboardNav({ user, business }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supabase] = useState(() => createClient())

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
          <PhoneCall className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold">FrontDesk AI</div>
          {business && (
            <div className="text-xs text-muted-foreground truncate max-w-[130px]">
              {business.business_name}
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {business && (
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Plan</span>
            <Badge
              variant={business.subscription_status === 'active' ? 'success' : 'warning'}
              className="text-xs capitalize"
            >
              {business.plan}
            </Badge>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'h-1.5 w-1.5 rounded-full',
                business.subscription_status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              )} />
              <span className="text-xs capitalize">{business.subscription_status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? 'bg-brand-100 text-brand-700'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
            {user.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r bg-background min-h-screen">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <PhoneCall className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">FrontDesk AI</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r bg-background shadow-xl">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
