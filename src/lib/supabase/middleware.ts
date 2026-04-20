import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const authRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password']
  const protectedRoutes = ['/dashboard', '/settings', '/billing']
  const onboardingRoute = '/onboarding'

  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r))
  const isOnboarding = pathname.startsWith(onboardingRoute)

  // Unauthenticated users can't access protected pages or onboarding
  if (!user && (isProtectedRoute || isOnboarding)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Authenticated users on auth routes → send to dashboard
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // For authenticated users hitting protected dashboard routes, enforce subscription
  if (user && isProtectedRoute) {
    const { data: business } = await supabase
      .from('business_profiles')
      .select('subscription_status, onboarding_completed')
      .eq('user_id', user.id)
      .single()

    // No business profile yet → complete onboarding first
    if (!business) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }

    // Has profile but payment not done (incomplete = no subscription started)
    // Redirect to the payment step so they can't skip card collection
    if (
      business.subscription_status === 'incomplete' &&
      !business.onboarding_completed
    ) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      redirectUrl.searchParams.set('step', 'payment')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
