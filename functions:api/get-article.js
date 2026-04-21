import { createClient } from '@supabase/supabase-js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id   = url.searchParams.get('id');
  const slug = url.searchParams.get('slug');

  if (!id && !slug) {
    return new Response('Paramètre id ou slug manquant', { status: 400 });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

  let query = supabase
    .from('articles')
    .select('id, title, excerpt, author, category, journal, doi, date, content, footnotes, published, created_at');

  if (id)   query = query.eq('id', id);
  else      query = query.eq('slug', slug);

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (!data || data.length === 0) {
    return new Response('Article introuvable', { status: 404 });
  }

  return new Response(JSON.stringify(data[0]), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
