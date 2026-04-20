const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const treaty = event.queryStringParameters?.treaty;
  let query = supabase.from('code_articles').select('*').order('sort_order');
  if (treaty) query = query.eq('treaty', treaty);

  const { data, error } = await query;

  return {
    statusCode: error ? 500 : 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(error ? { error: error.message } : (data || []))
  };
};
