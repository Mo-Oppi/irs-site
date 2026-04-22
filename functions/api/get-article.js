
export async function onRequest({ env, request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  const params = new URL(request.url).searchParams;
  const id   = params.get('id');
  const slug = params.get('slug');

  if (!id && !slug) {
    return new Response('Paramètre id ou slug manquant', { status: 400 });
  }

  const filter = id ? `id=eq.${encodeURIComponent(id)}` : `slug=eq.${encodeURIComponent(slug)}`;
  const url = `${env.SUPABASE_URL}/rest/v1/articles?${filter}&select=id,title,excerpt,author,category,journal,doi,date,content,footnotes,published,created_at&limit=1`;

  const res = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors() }
    });
  }

  const data = await res.json();
  if (!data || data.length === 0) {
    return new Response('Article introuvable', { status: 404 });
  }

  return new Response(JSON.stringify(data[0]), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors() }
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
