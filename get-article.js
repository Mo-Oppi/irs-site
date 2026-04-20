const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const { id, slug } = event.queryStringParameters || {};
  if (!id && !slug) return { statusCode: 400, body: 'id ou slug manquant' };

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  let query = supabase.from('articles').select('*');
  if (id) query = query.eq('id', id);
  else query = query.eq('slug', slug);
  const { data, error } = await query.single();

  if (error || !data) return { statusCode: 404, body: 'Article introuvable' };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data)
  };
};
