export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
export type OnboardingStep = 'business' | 'contact' | 'services' | 'plan' | 'payment'

export interface PricingPlan {
  id: SubscriptionPlan
  name: string
  description: string
  price: number
  yearlyPrice: number
  priceId: string
  yearlyPriceId?: string
  features: string[]
  callsPerMonth: number
  popular?: boolean
}

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  business_type: string
  phone_number: string
  email: string
  website?: string
  address?: string
  city?: string
  state?: string
  country: string
  timezone: string
  greeting_message?: string
  after_hours_message?: string
  services: string[]
  plan: SubscriptionPlan
  subscription_status: SubscriptionStatus
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_end?: string
  vapi_assistant_id?: string
  twilio_phone_number?: string
  cal_username?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingFormData {
  // Step 1: Business Info
  business_name: string
  business_type: string
  website?: string
  address?: string
  city?: string
  state?: string
  country: string
  timezone: string

  // Step 2: Contact Info
  phone_number: string
  email: string
  contact_name: string

  // Step 3: Services & AI Config
  services: string[]
  greeting_message: string
  after_hours_message: string
  hours_of_operation: HoursOfOperation

  // Step 4: Plan Selection
  plan: SubscriptionPlan
  billing_cycle: 'monthly' | 'yearly'
}

export interface HoursOfOperation {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  open: boolean
  from: string
  to: string
}

export const BUSINESS_TYPES = [
  'Restaurant / Food Service',
  'Medical / Healthcare',
  'Legal Services',
  'Real Estate',
  'Beauty / Salon / Spa',
  'Home Services / Contractor',
  'Retail Store',
  'Professional Services',
  'Financial Services',
  'Fitness / Gym',
  'Automotive',
  'Education / Tutoring',
  'Dental Practice',
  'Veterinary',
  'Other',
] as const

export const SERVICES_OPTIONS = [
  'Appointment Scheduling',
  'Call Answering & Routing',
  'FAQ / General Inquiries',
  'Order Taking',
  'Lead Capture',
  'Emergency Dispatch',
  'After-Hours Handling',
  'Customer Complaints',
  'Service Quotes',
  'Product Information',
] as const

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses just getting started',
    price: 79,
    yearlyPrice: 67,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
    callsPerMonth: 200,
    features: [
      '200 AI-handled calls/month',
      '24/7 call answering',
      'Appointment scheduling',
      'SMS notifications',
      'Basic call analytics',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses with higher call volumes',
    price: 149,
    yearlyPrice: 127,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    callsPerMonth: 600,
    popular: true,
    features: [
      '600 AI-handled calls/month',
      '24/7 call answering',
      'Advanced appointment scheduling',
      'Cal.com integration',
      'SMS & email notifications',
      'Detailed analytics & reports',
      'CRM integration',
      'Priority support',
      'Custom greeting scripts',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited capacity for high-volume businesses',
    price: 299,
    yearlyPrice: 254,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    callsPerMonth: Infinity,
    features: [
      'Unlimited AI-handled calls',
      '24/7 call answering',
      'Advanced appointment scheduling',
      'Cal.com integration',
      'Full CRM integration',
      'Custom AI voice & personality',
      'Multi-location support',
      'Advanced analytics & API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
]
