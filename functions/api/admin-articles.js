import { createClient } from '@supabase/supabase-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const password = url.searchParams.get('password');

  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response('Non autorisé', { status: 401 });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return new Response(
    JSON.stringify(error ? { error: error.message } : data),
    { status: error ? 500 : 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}
