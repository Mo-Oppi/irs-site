const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, author, category, journal, doi, date, created_at')
    .eq('published', true)
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
