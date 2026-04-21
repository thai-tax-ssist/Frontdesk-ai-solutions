import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const SignUpForm = dynamic(() => import('./SignUpForm'), { ssr: false })

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="space-y-4 animate-pulse"><div className="h-8 bg-muted rounded w-48" /><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}
