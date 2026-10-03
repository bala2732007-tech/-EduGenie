import { summarizeText } from '../../src/server/gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let text: string | undefined;

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await req.json();
        text = body.text;
      } catch {
        // Ignored
      }
    }

    if (!text) {
      const url = new URL(req.url);
      text = url.searchParams.get('text') || undefined;
    }

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'Please provide text to summarize.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const summary = await summarizeText(text.trim());
    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `⚠️ Error in Summary: ${error?.message || error}` }),
      { status: 500, headers: corsHeaders }
    );
  }
};
