const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return {
    statusCode: error ? 500 : 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(error ? { error } : data)
  };
};
