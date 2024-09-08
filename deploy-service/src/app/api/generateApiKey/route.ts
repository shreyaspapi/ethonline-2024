// pages/api/generateApiKey.ts
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const apiKey = uuidv4(); // Generate a unique API key
    await saveApiKeyToDb(req.body.userId, apiKey); // Save the API key to your database
    res.status(200).json({ apiKey });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

async function saveApiKeyToDb(userId: string, apiKey: string) {
  // Add logic to save API key to your database (e.g., Supabase)
}
