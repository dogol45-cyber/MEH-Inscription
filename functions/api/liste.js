export async function onRequestGet({env}){

const {results}=await env.DB.prepare(
"SELECT * FROM inscriptions ORDER BY id DESC"
).all();

return Response.json(results);

}
