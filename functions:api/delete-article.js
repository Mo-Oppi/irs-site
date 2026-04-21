import { createClient } from '@supabase/supabase-js';

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

  const { password, id } = body;

  if (!password || password !== env.ADMIN_PASSWORD) {
    return new Response('Mot de passe incorrect', { status: 401 });
  }
  if (!id) return new Response('id manquant', { status: 400 });

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY
  );

  const { error } = await supabase.from('articles').delete().eq('id', id);

  return new Response(
    JSON.stringify(error ? { error: error.message } : { success: true }),
    { status: error ? 500 : 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
}
