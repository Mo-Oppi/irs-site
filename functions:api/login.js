const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); }
  catch (e) { return new Response('JSON invalide', { status: 400 }); }

  if (body.password === env.ADMIN_PASSWORD) {
    return new Response('ok', { status: 200, headers: CORS });
  }
  return new Response('bad password', { status: 401, headers: CORS });
}
