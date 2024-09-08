import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.next();
  }
  if (!apiKey || !validateApiKey(apiKey)) {
    return NextResponse.json({ message: 'Invalid API Key' }, { status: 401 });
  }
  return NextResponse.next();
}

function validateApiKey(apiKey: string): boolean {
  // Implement your API key validation logic here
  return true; // Replace with actual validation
}

export const config = {
  matcher: '/api/:path*',
};
