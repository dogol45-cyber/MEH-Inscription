// Connexion : POST { username, password } → renvoie un token
export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username et password requis" },
        { status: 400 }
      );
    }

    const user = await env.DB.prepare(
      "SELECT * FROM utilisateurs WHERE username = ? AND actif = 1"
    ).bind(username).first();

    if (!user) {
      return Response.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    const hash = await sha256(password);
    if (hash !== user.password_hash) {
      return Response.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Nettoyer les vieilles sessions expirées
    await env.DB.prepare(
      "DELETE FROM sessions WHERE expire_le < ?"
    ).bind(new Date().toISOString()).run();

    // Créer une session valable 24h
    const token = genererToken();
    const expire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const date = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO sessions (token, user_id, expire_le, date_creation) VALUES (?, ?, ?, ?)"
    ).bind(token, user.id, expire, date).run();

    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nom_complet: user.nom_complet,
        role: user.role
      }
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function genererToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(texte) {
  const data = new TextEncoder().encode(texte);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
