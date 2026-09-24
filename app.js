const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const photo = document.getElementById("photo").files[0];

    if (!photo) {
        alert("Veuillez ajouter la photo de votre pièce d'identité.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function () {

        const data = {
            nom: form.nom.value,
            prenom: form.prenom.value,
            sexe: form.sexe.value,
            naissance: form.naissance.value,
            lieu: form.lieu.value,
            adresse: form.adresse.value,
            telephone: form.telephone.value,
            email: form.email.value,
            parent: form.parent.value,
            tel_parent: form.tel_parent.value,
            option: form.option.value,
            photo_piece: reader.result
        };

        const response = await fetch("/api/inscription", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(
                "Inscription réussie !\n\nNuméro : " +
                result.numero
            );

            form.reset();

        } else {

            alert("Erreur : " + result.error);

        }

    };

    reader.readAsDataURL(photo);

});
