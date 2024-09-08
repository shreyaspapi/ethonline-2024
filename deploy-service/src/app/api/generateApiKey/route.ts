import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const apiKey = uuidv4(); // Generate a unique API key
  await saveApiKeyToDb(body.userId, apiKey); // Save the API key to your database
  return NextResponse.json({ apiKey });
}

async function saveApiKeyToDb(userId: string, apiKey: string) {
  // Add logic to save API key to your database (e.g., Supabase)
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
