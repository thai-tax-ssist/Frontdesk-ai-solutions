import Link from 'next/link'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — FrontDesk AI',
  description: 'How FrontDesk AI collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  const lastUpdated = '20 April 2026'
  const company = 'FrontDesk AI Solutions'
  const email = 'privacy@frontdeskai.app'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <Shield className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
            <p className="text-muted-foreground">
              {company} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the FrontDesk AI platform.
              We are committed to protecting your personal data and complying with the General Data Protection
              Regulation (GDPR) and applicable data protection laws. For data protection enquiries, contact us at{' '}
              <a href={`mailto:${email}`} className="text-brand-600">{email}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
              <li><strong>Account data:</strong> Email address, full name, password (hashed).</li>
              <li><strong>Business data:</strong> Business name, address, phone number, website.</li>
              <li><strong>Call data:</strong> Caller phone numbers, call recordings, transcripts, summaries, appointment status.</li>
              <li><strong>Payment data:</strong> Processed by Stripe. We store only a customer reference ID — never raw card details.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, IP address, browser type (analytics).</li>
              <li><strong>Communications:</strong> Support emails and messages you send us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Legal Basis for Processing</h2>
            <p className="text-muted-foreground mb-2">We process your data under the following legal bases (GDPR Article 6):</p>
            <ul className="space-y-1 text-muted-foreground list-disc pl-5">
              <li><strong>Contract performance:</strong> Processing necessary to deliver our services.</li>
              <li><strong>Legitimate interest:</strong> Fraud prevention, security, service improvement.</li>
              <li><strong>Legal obligation:</strong> Compliance with tax and regulatory requirements.</li>
              <li><strong>Consent:</strong> Analytics cookies and marketing communications (withdrawable at any time).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Use Your Data</h2>
            <ul className="space-y-1 text-muted-foreground list-disc pl-5">
              <li>Providing and improving the FrontDesk AI service</li>
              <li>Processing payments via Stripe</li>
              <li>Sending transactional emails (account verification, receipts, alerts)</li>
              <li>AI call handling and transcription via Vapi.ai</li>
              <li>Phone number provisioning via Twilio</li>
              <li>Appointment booking via Cal.com</li>
              <li>Customer support and responding to enquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Processors</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-3 py-2 text-left">Processor</th>
                    <th className="border border-border px-3 py-2 text-left">Purpose</th>
                    <th className="border border-border px-3 py-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ['Supabase', 'Database & authentication', 'EU (AWS Frankfurt)'],
                    ['Stripe', 'Payment processing', 'US / EU'],
                    ['Vapi.ai', 'AI call handling', 'US'],
                    ['Twilio', 'Phone number & SMS', 'US / EU'],
                    ['Cal.com', 'Appointment scheduling', 'EU'],
                    ['Resend', 'Transactional email', 'US'],
                  ].map(([p, purpose, loc]) => (
                    <tr key={p}>
                      <td className="border border-border px-3 py-2 font-medium">{p}</td>
                      <td className="border border-border px-3 py-2">{purpose}</td>
                      <td className="border border-border px-3 py-2">{loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active, plus 30 days after account deletion for
              backup purposes. Call recordings are retained for 90 days. Payment records are retained for 7 years
              per tax law. You may request earlier deletion at any time (see Your Rights below).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights (GDPR)</h2>
            <p className="text-muted-foreground mb-2">Under GDPR you have the right to:</p>
            <ul className="space-y-1 text-muted-foreground list-disc pl-5">
              <li><strong>Access</strong> your data — export all data from Settings → Privacy</li>
              <li><strong>Rectification</strong> — correct inaccurate data in your account settings</li>
              <li><strong>Erasure</strong> — delete your entire account from Settings → Privacy</li>
              <li><strong>Portability</strong> — download your data as JSON from Settings → Privacy</li>
              <li><strong>Restriction</strong> — request we stop processing your data</li>
              <li><strong>Object</strong> — opt out of marketing and analytics</li>
              <li><strong>Withdraw consent</strong> — for cookies and marketing at any time</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              To exercise your rights, email <a href={`mailto:${email}`} className="text-brand-600">{email}</a> or
              use the tools in your dashboard. We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground">
              We use strictly necessary cookies for authentication and session management. With your consent,
              we may use analytics cookies. You can manage preferences via the cookie banner or your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Security</h2>
            <p className="text-muted-foreground">
              All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement Row-Level Security
              on all database tables, ensuring users can only access their own data. Passwords are hashed using bcrypt.
              We perform regular security reviews and access audits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact & Complaints</h2>
            <p className="text-muted-foreground">
              For privacy questions: <a href={`mailto:${email}`} className="text-brand-600">{email}</a>.
              You have the right to lodge a complaint with your national supervisory authority
              (e.g., the ICO in the UK, or the relevant DPA in your EU country).
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
