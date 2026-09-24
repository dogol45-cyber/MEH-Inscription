document.getElementById("form").addEventListener("submit", async function(e){

    e.preventDefault();

    const form = e.target;

    const data = new FormData(form);

    const inscription = {
        nom: data.get("nom"),
        prenom: data.get("prenom"),
        sexe: data.get("sexe"),
        naissance: data.get("naissance"),
        lieu: data.get("lieu"),
        adresse: data.get("adresse"),
        telephone: data.get("telephone"),
        email: data.get("email"),
        parent: data.get("parent"),
        tel_parent: data.get("tel_parent"),
        option: data.get("option")
    };

    alert(
        "Merci " +
        inscription.prenom +
        " ! Votre inscription a été enregistrée."
    );

    console.log(inscription);

});
