// ═══════════════════════════════════════════════════════════════════════
//  INSTRUCTIONS
//  Dans votre dépôt GitHub, créez le dossier : netlify/functions/
//  Puis créez trois fichiers séparés en copiant chaque section ci-dessous.
// ═══════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────
//  FICHIER 1 : netlify/functions/get-articles.js
//  Rôle : renvoie tous les articles PUBLIÉS (lecture publique)
// ─────────────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────────────
//  FICHIER 2 : netlify/functions/get-article.js
//  Rôle : renvoie UN article complet par son id (avec le contenu HTML)
// ─────────────────────────────────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: 'id manquant' };

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { statusCode: 404, body: 'Article introuvable' };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data)
  };
};


// ─────────────────────────────────────────────────────────────────────
//  FICHIER 3 : netlify/functions/save-article.js
//  Rôle : crée ou met à jour un article (protégé par mot de passe)
// ─────────────────────────────────────────────────────────────────────

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

  const { password, article } = body;

  // Vérification du mot de passe (= variable d'environnement ADMIN_PASSWORD sur Netlify)
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Mot de passe incorrect' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  const { error } = await supabase
    .from('articles')
    .upsert(article, { onConflict: 'id' });

  return {
    statusCode: error ? 500 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(error ? { error: error.message } : { success: true })
  };
};


// ─────────────────────────────────────────────────────────────────────
//  FICHIER 4 : netlify/functions/delete-article.js
//  Rôle : supprime un article par son id (protégé par mot de passe)
// ─────────────────────────────────────────────────────────────────────

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


// ─────────────────────────────────────────────────────────────────────
//  FICHIER 5 : netlify/functions/admin-articles.js
//  Rôle : renvoie TOUS les articles (publiés + brouillons) pour l'admin
// ─────────────────────────────────────────────────────────────────────

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
