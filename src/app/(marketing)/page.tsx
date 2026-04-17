import Link from 'next/link'
import { PhoneCall, Clock, Calendar, BarChart3, Shield, Globe, Check, ArrowRight, Star, Zap, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PRICING_PLANS } from '@/types'
import { formatCurrency } from '@/lib/utils'

const FEATURES = [
  {
    icon: PhoneCall,
    title: '24/7 AI Call Answering',
    description: 'Never miss a call again. Our AI receptionist answers every call professionally, day or night, holidays included.',
  },
  {
    icon: Calendar,
    title: 'Smart Appointment Booking',
    description: 'Seamlessly books appointments directly into your calendar with Cal.com integration — no double-bookings.',
  },
  {
    icon: Clock,
    title: 'Instant Response',
    description: 'Zero hold time. Callers get immediate, professional attention with natural-sounding AI conversations.',
  },
  {
    icon: BarChart3,
    title: 'Call Analytics & Reports',
    description: 'Detailed insights on call volume, peak times, common inquiries, and conversion rates.',
  },
  {
    icon: Shield,
    title: 'Spam & Robocall Filtering',
    description: 'Intelligent filtering blocks spam and robocalls, so only real customers get through.',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Serve customers in their preferred language with AI that speaks naturally in 30+ languages.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    business: 'Bloom Beauty Salon, Texas',
    rating: 5,
    quote: 'FrontDesk AI has completely transformed how we handle calls. We\'ve booked 40% more appointments since signing up — the AI never misses a call and sounds so professional.',
  },
  {
    name: 'Dr. James K.',
    business: 'Kensington Dental, London',
    rating: 5,
    quote: 'Our front desk staff were overwhelmed with calls. Now FrontDesk AI handles 80% of them automatically. Patients love how quickly they get through.',
  },
  {
    name: 'Mike R.',
    business: 'Rodriguez Plumbing, California',
    rating: 5,
    quote: 'I used to lose jobs because I couldn\'t answer calls while working. Now every call is answered, emergencies are flagged, and I\'ve doubled my revenue.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Sign up & configure',
    description: 'Create your account, tell us about your business, set your hours, and customize your AI\'s greeting and responses.',
  },
  {
    step: '02',
    title: 'Forward your calls',
    description: 'We provision a dedicated number or you forward your existing number to FrontDesk AI. Setup takes under 5 minutes.',
  },
  {
    step: '03',
    title: 'AI handles everything',
    description: 'Your AI receptionist answers calls, books appointments, captures leads, and sends you real-time notifications.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-indigo-50" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Zap className="mr-1.5 h-3 w-3" />
              Powered by Advanced AI Voice Technology
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Your AI Receptionist,{' '}
              <span className="text-gradient">Always On</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
              FrontDesk AI answers every call professionally, books appointments, captures leads, and handles customer inquiries — 24/7, in any language, for a fraction of the cost of a human receptionist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" variant="gradient" asChild>
                <Link href="/sign-up">
                  Start 14-day free trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Cancel anytime · Setup in 5 minutes
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12">
            {[
              { stat: '2,000+', label: 'Businesses served' },
              { stat: '5M+', label: 'Calls handled' },
              { stat: '98%', label: 'Satisfaction rate' },
              { stat: '40%', label: 'More appointments' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-bold text-brand-600">{item.stat}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-muted-foreground text-lg">
              No technical skills needed. Your AI receptionist is ready to take calls faster than hiring staff.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
                  <span className="text-xl font-bold text-brand-600">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything your business needs</h2>
            <p className="text-muted-foreground text-lg">
              Professional call handling powered by the latest AI voice technology.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 mb-2">
                    <feature.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Loved by businesses worldwide</h2>
            <p className="text-muted-foreground text-lg">Join thousands of businesses who trust FrontDesk AI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-muted-foreground mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">
              Start free for 14 days. No credit card required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? 'border-brand-500 border-2 shadow-lg shadow-brand-100' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-brand-600 text-white px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save 15% with yearly billing ({formatCurrency(plan.yearlyPrice)}/mo)
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    asChild
                  >
                    <Link href="/sign-up">Start free trial</Link>
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime. No setup fees.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop missing calls. Start growing.
          </h2>
          <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
            Join 2,000+ businesses that rely on FrontDesk AI to handle their calls professionally, 24/7.
          </p>
          <Button size="xl" className="bg-white text-brand-700 hover:bg-brand-50" asChild>
            <Link href="/sign-up">
              Start your free trial today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-brand-300 text-sm">
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>
    </>
  )
}
