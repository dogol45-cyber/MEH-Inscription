// Création du PREMIER utilisateur (une seule fois)
export async function onRequestPost({ request, env }) {
  try {
    const count = await env.DB.prepare(
      "SELECT COUNT(*) as n FROM utilisateurs"
    ).first();

    if (count && count.n > 0) {
      return Response.json(
        { error: "Un utilisateur existe déjà. Connectez-vous sur /admin.html" },
        { status: 403 }
      );
    }

    const { username, password, nom_complet } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username et password requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Mot de passe trop court (min 8 caractères)" },
        { status: 400 }
      );
    }

    const hash = await sha256(password);
    const date = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO utilisateurs (username, password_hash, nom_complet, role, actif, date_creation) VALUES (?, ?, ?, 'admin', 1, ?)"
    ).bind(username, hash, nom_complet || username, date).run();

    return Response.json({
      success: true,
      message: "Premier utilisateur créé. Connectez-vous sur /admin.html"
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function sha256(texte) {
  const data = new TextEncoder().encode(texte);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
