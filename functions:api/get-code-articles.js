import { createClient } from '@supabase/supabase-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const treaty = url.searchParams.get('treaty');

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

  let query = supabase.from('code_articles').select('*').order('sort_order');
  if (treaty) query = query.eq('treaty', treaty);

  const { data, error } = await query;

  return new Response(
    JSON.stringify(error ? { error: error.message } : (data || [])),
    { status: error ? 500 : 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}
