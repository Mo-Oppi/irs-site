const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const password = event.queryStringParameters?.password;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Non autorisé' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    statusCode: error ? 500 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(error ? { error: error.message } : data)
  };
};
