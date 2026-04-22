export async function onRequest({ env, request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  let body;
  try { body = await request.json(); }
  catch (e) { return new Response('JSON invalide', { status: 400 }); }

  if (body.password === env.ADMIN_PASSWORD) {
    return new Response('ok', { status: 200, headers: cors() });
  }
  return new Response('bad password', { status: 401, headers: cors() });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
