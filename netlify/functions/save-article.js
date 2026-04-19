const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  const { password, article } = JSON.parse(event.body);
  if (password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Non autorisé' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  const { error } = await supabase
    .from('articles')
    .upsert(article);

  return {
    statusCode: error ? 500 : 200,
    body: JSON.stringify({ success: !error, error })
  };
};
