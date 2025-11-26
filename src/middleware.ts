import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone() // clone agar mutable
  const { pathname } = url

  // sitemap.xml
  if (pathname === '/sitemap.xml') {
    url.pathname = '/seo'          // arahkan ke route /seo
    url.searchParams.set('sitemap', '1')
    return NextResponse.rewrite(url)
  }

  // robots.txt
  if (pathname === '/robots.txt') {
    url.pathname = '/seo'
    url.searchParams.set('robots', '1')
    return NextResponse.rewrite(url)
  }

  // google*.html
  const googleVerificationRegex = /^\/google([a-zA-Z0-9_-]+)\.html$/
  const match = pathname.match(googleVerificationRegex)
  if (match) {
    const fileName = pathname.slice(1)
    url.pathname = '/seo'
    url.searchParams.set('google', fileName)
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/sitemap.xml',
    '/robots.txt',
    '/(google.*\\.html)',
  ],
}
