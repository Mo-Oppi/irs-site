
export async function onRequest({ env, request }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }

  const treaty = new URL(request.url).searchParams.get('treaty');
  let url = `${env.SUPABASE_URL}/rest/v1/code_articles?select=*&order=sort_order.asc,article_num.asc`;
  if (treaty) url += `&treaty=eq.${encodeURIComponent(treaty)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const text = await res.text();

    // Si la table n'existe pas encore → retourner [] pour ne pas bloquer le front
    if (!res.ok) {
      let errMsg = text;
      try { errMsg = JSON.parse(text).message || text; } catch(e){}
      const isNoTable = errMsg.includes('does not exist') || errMsg.includes('42P01');
      if (isNoTable) {
        return new Response('[]', {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...cors() }
        });
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...cors() }
      });
    }

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors() }
    });

  } catch(e) {
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors() }
    });
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
