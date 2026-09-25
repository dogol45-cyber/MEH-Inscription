import { verifierSession, nonAutorise } from "../_utils/auth.js";

export async function onRequestGet({ request, env }) {
  const session = await verifierSession(request, env);
  if (!session) return nonAutorise();

  const { results } = await env.DB.prepare(
    "SELECT * FROM inscriptions ORDER BY id DESC"
  ).all();

  return Response.json(results);
}
