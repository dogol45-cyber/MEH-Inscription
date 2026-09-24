// API : modification d'une inscription
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return Response.json({ error: "ID manquant" }, { status: 400 });
    }

    await env.DB.prepare(`
      UPDATE inscriptions SET
        nom = ?,
        prenom = ?,
        sexe = ?,
        naissance = ?,
        lieu = ?,
        adresse = ?,
        telephone = ?,
        email = ?,
        parent = ?,
        tel_parent = ?,
        option_formation = ?
      WHERE id = ?
    `).bind(
      data.nom || "",
      data.prenom || "",
      data.sexe || "",
      data.naissance || "",
      data.lieu || "",
      data.adresse || "",
      data.telephone || "",
      data.email || "",
      data.parent || "",
      data.tel_parent || "",
      data.option_formation || "",
      id
    ).run();

    return Response.json({ success: true, message: "Inscription modifiée" });

  } catch (err) {
    return Response.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
