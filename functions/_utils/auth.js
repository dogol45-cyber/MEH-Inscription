// Helper partagé : vérifier une session
export async function verifierSession(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) return null;

  const session = await env.DB.prepare(
    "SELECT s.*, u.username, u.nom_complet, u.role FROM sessions s JOIN utilisateurs u ON u.id = s.user_id WHERE s.token = ?"
  ).bind(token).first();

  if (!session) return null;

  if (new Date(session.expire_le) < new Date()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }

  return session;
}

export function nonAutorise() {
  return Response.json(
    { error: "Non autorisé. Veuillez vous connecter." },
    { status: 401 }
  );
}
