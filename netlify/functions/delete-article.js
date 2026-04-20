const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: 'JSON invalide' }; }

  const { password, id } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Mot de passe incorrect' };
  }
  if (!id) { return { statusCode: 400, body: 'id manquant' }; }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  return {
    statusCode: error ? 500 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(error ? { error: error.message } : { success: true })
  };
};
