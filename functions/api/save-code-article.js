
export async function onRequest({ env, request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== 'POST') {
    return new Response('Méthode non autorisée', { status: 405 });
  }

  let body;
  try { body = await request.json(); }
  catch (e) { return new Response('JSON invalide', { status: 400 }); }

  const { password, article } = body;
  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response('Non autorisé', { status: 401 });
  }

  article.updated_at = new Date().toISOString();

  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const url = `${env.SUPABASE_URL}/rest/v1/code_articles`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(article)
  });

  const ok = res.ok;
  return new Response(JSON.stringify(ok ? { success: true } : { error: await res.text() }), {
    status: ok ? 200 : 500,
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
