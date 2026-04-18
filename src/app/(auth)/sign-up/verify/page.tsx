import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email || 'your email'

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
        <MailCheck className="h-8 w-8 text-brand-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-muted-foreground">
          We sent a verification link to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Click the link in the email to activate your account and start your free trial.
      </p>
      <p className="text-sm text-muted-foreground">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <Link href="/sign-up" className="text-primary hover:underline">
          try again
        </Link>
      </p>
      <Button variant="outline" asChild className="w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </div>
  )
}
