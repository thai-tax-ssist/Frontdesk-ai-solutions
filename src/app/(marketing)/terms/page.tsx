import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — FrontDesk AI',
  description: 'Terms and conditions for using FrontDesk AI.',
}

export default function TermsPage() {
  const lastUpdated = '20 April 2026'
  const company = 'FrontDesk AI Solutions'
  const email = 'legal@frontdeskai.app'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <FileText className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using {company} (&quot;Service&quot;), you agree to be bound by these Terms.
              If you do not agree, do not use the Service. These Terms apply to all users, including business
              owners and their representatives.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
            <p className="text-muted-foreground">
              {company} provides an AI-powered telephone receptionist service (&quot;Anna&quot;) that answers
              calls, books appointments, captures leads, and sends follow-up messages on behalf of your business.
              The Service integrates with Vapi.ai, Twilio, and Cal.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Free Trial & Subscription</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li>New accounts receive a <strong>14-day free trial</strong>. No charge is made during the trial period.</li>
              <li>A valid payment method is required at signup. Your card will be charged automatically after the 14-day trial ends unless you cancel beforehand.</li>
              <li>Subscription plans: Starter (€97/mo), Pro (€197/mo), Enterprise (€397/mo). Yearly billing available at a 15% discount.</li>
              <li>No setup fees on any plan.</li>
              <li>You may cancel at any time from your billing dashboard. Cancellation takes effect at the end of the current billing period.</li>
              <li>Refunds are issued at our discretion for unused periods. Contact <a href={`mailto:${email}`} className="text-brand-600">{email}</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-2">You agree not to use the Service to:</p>
            <ul className="space-y-1 text-muted-foreground list-disc pl-5">
              <li>Engage in illegal, fraudulent, or deceptive activities</li>
              <li>Harass, threaten, or harm any person</li>
              <li>Send spam or unsolicited marketing messages without consent</li>
              <li>Impersonate another person or business</li>
              <li>Violate any applicable laws, including telemarketing and consumer protection laws</li>
              <li>Attempt to reverse-engineer or interfere with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Call Recording & Consent</h2>
            <p className="text-muted-foreground">
              You are solely responsible for ensuring callers are informed that their calls may be recorded and
              handled by an AI. You must comply with all applicable call recording laws in your jurisdiction.
              {company} provides the technology; legal compliance is your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data & Privacy</h2>
            <p className="text-muted-foreground">
              Use of the Service is subject to our{' '}
              <Link href="/privacy" className="text-brand-600">Privacy Policy</Link>.
              By using the Service, you agree to the collection and use of information as described therein.
              You retain ownership of your business data. We process it only to deliver the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service, including all software, AI models, and branding, is owned by {company} and protected
              by intellectual property law. Your business data and call logs remain your property.
              You grant us a limited licence to process your data solely to deliver the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, {company} shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including lost profits or data, arising from your use
              of the Service. Our total liability shall not exceed the amount you paid in the 3 months preceding
              the claim. The Service is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Service Availability</h2>
            <p className="text-muted-foreground">
              We target 99.9% uptime but do not guarantee uninterrupted service. We may perform maintenance
              with reasonable notice. We are not liable for downtime caused by third-party providers (Vapi.ai,
              Twilio, Cal.com, Stripe) or force majeure events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate accounts that violate these Terms. You may terminate your account
              at any time from your dashboard. Upon termination, your data will be deleted after 30 days
              (subject to legal retention requirements).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the European Union and the country in which {company}
              is registered. Disputes shall be resolved in the competent courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
            <p className="text-muted-foreground">
              For legal enquiries: <a href={`mailto:${email}`} className="text-brand-600">{email}</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-sm text-brand-600 hover:underline">
            ← Back to FrontDesk AI
          </Link>
        </div>
      </div>
    </div>
  )
}
