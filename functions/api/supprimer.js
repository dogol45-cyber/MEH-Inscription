import { verifierSession, nonAutorise } from "../_utils/auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const session = await verifierSession(request, env);
    if (!session) return nonAutorise();

    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "ID manquant" }, { status: 400 });
    }

    await env.DB.prepare("DELETE FROM inscriptions WHERE id = ?")
      .bind(id)
      .run();

    return Response.json({ success: true, message: "Inscription supprimée" });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
