import { answerQuestionWithGemini } from '../../src/server/gemini.ts';

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
    const url = new URL(req.url);
    let question = url.searchParams.get('question');

    if (!question && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        const body = await req.json();
        question = body.question;
      } catch {
        // Ignored if empty body
      }
    }

    if (!question || !question.trim()) {
      return new Response(JSON.stringify({ error: 'Please provide a question.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const answer = await answerQuestionWithGemini(question.trim());
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `⚠️ Error in QnA: ${error?.message || error}` }),
      { status: 500, headers: corsHeaders }
    );
  }
};
