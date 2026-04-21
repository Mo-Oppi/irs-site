import { createClient } from '@supabase/supabase-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestGet({ env }) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, author, category, journal, doi, date, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return new Response(JSON.stringify(error ? { error: error.message } : data), {
    status: error ? 500 : 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
