// API : suppression d'une inscription
export async function onRequestPost({ request, env }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "ID manquant" }, { status: 400 });
    }

    await env.DB.prepare("DELETE FROM inscriptions WHERE id = ?")
      .bind(id)
      .run();

    return Response.json({ success: true, message: "Inscription supprimée" });

  } catch (err) {
    return Response.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
