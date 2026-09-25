// Vérifie si un token est valide
import { verifierSession } from "../_utils/auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const session = await verifierSession(request, env);

    if (!session) {
      return Response.json({ valide: false }, { status: 401 });
    }

    return Response.json({
      valide: true,
      user: {
        id: session.user_id,
        username: session.username,
        nom_complet: session.nom_complet,
        role: session.role
      }
    });

  } catch (err) {
    return Response.json({ valide: false, error: err.message }, { status: 500 });
  }
}
