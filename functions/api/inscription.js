export async function onRequestPost(context) {

  const { request, env } = context;

  const data = await request.json();

  const numero =
    "MEH-" + Date.now();

  await env.DB.prepare(`
    INSERT INTO inscriptions (
      numero, nom, prenom, sexe,
      naissance, lieu, adresse,
      telephone, email, parent,
      tel_parent, option_formation,
      photo_piece, date_inscription
    )

    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)

  `).bind(

    numero,
    data.nom,
    data.prenom,
    data.sexe,
    data.naissance,
    data.lieu,
    data.adresse,
    data.telephone,
    data.email,
    data.parent,
    data.tel_parent,
    data.option,
    data.photo_piece,
    new Date().toISOString()

  ).run();

  return Response.json({
    success:true,
    numero
  });

}
