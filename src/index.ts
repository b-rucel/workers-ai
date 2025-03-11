/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Parse the request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      return new Response('Invalid JSON body', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Validate input
    const input_prompt = (requestData as { prompt: string }).prompt;
    if (!input_prompt || typeof input_prompt !== 'string') {
      return new Response('Missing or invalid prompt in request body', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const messages = [
      { role: "system", content: "You are a friendly assistant" },
      {
        role: "user",
        content: input_prompt,
      },
    ];
    const response = await env.AI.run("@cf/qwen/qwen1.5-14b-chat-awq", { messages });
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
} satisfies ExportedHandler<Env>;
