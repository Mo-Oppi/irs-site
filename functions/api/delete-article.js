
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

  const { password, id } = body;
  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response('Mot de passe incorrect', { status: 401 });
  }
  if (!id) return new Response('id manquant', { status: 400 });

  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
  const url = `${env.SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    }
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
