import { explainTopic } from '../../src/server/gemini.ts';

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
    let topic: string | undefined;

    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const body = await req.json();
        topic = body.topic;
      } catch {
        // Ignored
      }
    }

    if (!topic) {
      const url = new URL(req.url);
      topic = url.searchParams.get('topic') || undefined;
    }

    if (!topic || !topic.trim()) {
      return new Response(JSON.stringify({ error: 'Please provide a topic.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const explanation = await explainTopic(topic.trim());
    return new Response(JSON.stringify({ topic: topic.trim(), explanation }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `⚠️ Error in Explanation: ${error?.message || error}` }),
      { status: 500, headers: corsHeaders }
    );
  }
};
