import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || 'CRM_Management';

    cookieStore.delete(tokenKey);
    cookieStore.delete('token');
    cookieStore.delete('refreshToken');
    cookieStore.delete('session');

    cookieStore.set(tokenKey, '', { path: '/', expires: new Date(0), maxAge: 0 });
    cookieStore.set('token', '', { path: '/', expires: new Date(0), maxAge: 0 });
    cookieStore.set('refreshToken', '', { path: '/', expires: new Date(0), maxAge: 0 });

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete(tokenKey);
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    response.cookies.delete('session');

    response.cookies.set(tokenKey, '', { path: '/', expires: new Date(0), maxAge: 0 });
    response.cookies.set('token', '', { path: '/', expires: new Date(0), maxAge: 0 });
    response.cookies.set('refreshToken', '', { path: '/', expires: new Date(0), maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Failed to clear cookies in logout route:', error);
    return NextResponse.json({ success: false, message: 'Failed to clear cookies' }, { status: 500 });
  }
}
