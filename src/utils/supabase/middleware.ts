import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
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

  // 1. Giriş yapılmamışsa ve login/auth dışında bir yere gidiliyorsa -> Login'e at
  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Giriş yapılmışsa rol kontrolü yap
  if (user) {
    // Profil bilgisini çek (Rolü öğrenmek için)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Login sayfasına gitmeye çalışıyorsa ana sayfaya (role-router) yönlendir
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // İŞÇİ ise ve ADMIN sayfasına girmeye çalışıyorsa -> Kendi paneline at
    if (profile?.role === 'worker' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/worker', request.url))
    }

    // ADMIN ise ve WORKER sayfasına girmeye çalışıyorsa -> Kendi paneline at
    if (profile?.role === 'admin' && pathname.startsWith('/worker')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}
