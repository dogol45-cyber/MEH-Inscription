export async function onRequestPost({ request, env }) {

  const d = await request.json();

  const numero = "MEH-" + Date.now();

  await env.DB.prepare(`
    INSERT INTO inscriptions (
      numero, nom, prenom, sexe,
      naissance, lieu, adresse,
      telephone, email, parent,
      tel_parent, option_formation,
      photo_piece, date_inscription
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    numero,
    d.nom,
    d.prenom,
    d.sexe,
    d.naissance,
    d.lieu,
    d.adresse,
    d.telephone,
    d.email,
    d.parent,
    d.tel_parent,
    d.option,
    d.photo_piece,
    new Date().toISOString()
  ).run();

  return Response.json({
    success: true,
    numero
  });

}
