// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // const token = request.cookies.get('access_token');
  // const url = request.nextUrl.clone();

  // // Redirect to login if the token is not present and not accessing login/signup pages
  // if (!token && !url.pathname.startsWith('/login') && !url.pathname.startsWith('/signup')) {
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }
  // // Allow access if token is present or if accessing login/signup pages
  // return NextResponse.next();
}
// export const config = {
//   matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'], // Add protected routes here
// };
