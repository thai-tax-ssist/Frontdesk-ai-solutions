import Link from 'next/link'
import { PhoneCall } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-12 text-white">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <PhoneCall className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">FrontDesk AI</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Your AI receptionist works <span className="text-brand-300">24/7</span> — so you don&apos;t have to.
          </h1>
          <p className="text-brand-200 text-lg mb-10">
            Never miss a call. Never lose a lead. Let FrontDesk AI handle your calls professionally while you focus on growing your business.
          </p>

          <div className="space-y-4">
            {[
              { stat: '98%', label: 'Customer satisfaction rate' },
              { stat: '3x', label: 'More appointments booked' },
              { stat: '24/7', label: 'Always-on call coverage' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-white w-16">{item.stat}</div>
                <div className="text-brand-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-300 text-sm">
          Trusted by 2,000+ small businesses worldwide
        </p>
      </div>

      {/* Right: Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <PhoneCall className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">FrontDesk AI</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
