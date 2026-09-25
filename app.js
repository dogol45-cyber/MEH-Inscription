// ================================
// FORMULAIRE D'INSCRIPTION MEH
// ================================

const form = document.getElementById("form");
const photoInput = document.getElementById("photo");
const previewContainer = document.getElementById("preview-container");
const previewImg = document.getElementById("preview-img");
const previewInfo = document.getElementById("preview-info");
const messageEl = document.getElementById("message");
const btnSubmit = document.getElementById("btn-submit");

// ================================
// PRÉVISUALISATION DE LA PHOTO
// ================================
photoInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) {
    previewContainer.style.display = "none";
    return;
  }

  if (!file.type.startsWith("image/")) {
    afficherMessage("❌ Veuillez choisir un fichier image (JPG, PNG...).", "error");
    photoInput.value = "";
    previewContainer.style.display = "none";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    afficherMessage("❌ Image trop volumineuse (maximum 5 Mo).", "error");
    photoInput.value = "";
    previewContainer.style.display = "none";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewContainer.style.display = "block";
    const tailleKo = (file.size / 1024).toFixed(0);
    previewInfo.textContent = "📎 " + file.name + " — " + tailleKo + " Ko";
    cacherMessage();
  };
  reader.readAsDataURL(file);
});

// ================================
// MESSAGE
// ================================
function afficherMessage(texte, type) {
  messageEl.innerHTML = texte;
  messageEl.className = "message " + type;
  messageEl.style.display = "block";
  messageEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cacherMessage() {
  messageEl.style.display = "none";
}

// ================================
// VALIDATIONS
// ================================
function validerTelephone(tel) {
  const regex = /^[\d\s\+\-\(\)\.]{8,20}$/;
  return regex.test(tel.trim());
}

function validerEmail(email) {
  if (!email) return true;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

// ================================
// SOUMISSION
// ================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  cacherMessage();

  // Validations
  const telephone = form.telephone.value.trim();
  if (!validerTelephone(telephone)) {
    afficherMessage("❌ Numéro de téléphone invalide. Exemple : +509 1234 5678", "error");
    form.telephone.focus();
    return;
  }

  const email = form.email.value.trim();
  if (email && !validerEmail(email)) {
    afficherMessage("❌ Adresse email invalide.", "error");
    form.email.focus();
    return;
  }

  const telParent = form.tel_parent.value.trim();
  if (!validerTelephone(telParent)) {
    afficherMessage("❌ Numéro de téléphone du parent invalide.", "error");
    form.tel_parent.focus();
    return;
  }

  const photo = photoInput.files[0];
  if (!photo) {
    afficherMessage("❌ Veuillez ajouter la photo de votre pièce d'identité.", "error");
    return;
  }

  // Désactiver le bouton
  btnSubmit.disabled = true;
  btnSubmit.textContent = "⏳ Envoi en cours...";

  const reader = new FileReader();

  reader.onload = async function () {
    const data = {
      nom: form.nom.value.trim(),
      prenom: form.prenom.value.trim(),
      sexe: form.sexe.value,
      naissance: form.naissance.value,
      lieu: form.lieu.value.trim(),
      adresse: form.adresse.value.trim(),
      telephone: telephone,
      email: email,
      parent: form.parent.value.trim(),
      tel_parent: telParent,
      option: form.option.value,
      photo_piece: reader.result
    };

    try {
      const response = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        afficherMessage(
          "✅ <strong>Inscription réussie !</strong><br><br>" +
          "Votre numéro d'inscription est :<br>" +
          "<span style='font-size:1.5rem; font-weight:bold; color:#8B0000; display:block; margin:15px 0;'>" +
          result.numero +
          "</span>" +
          "📌 <strong>Conservez précieusement ce numéro.</strong><br>" +
          "L'administration vous contactera bientôt.",
          "success"
        );
          
        form.reset();
        previewContainer.style.display = "none";

      } else {
        afficherMessage("❌ Erreur : " + (result.error || "Inconnue"), "error");
      }

    } catch (err) {
      afficherMessage("❌ Erreur réseau : " + err.message, "error");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "S'INSCRIRE";
    }
  };

  reader.readAsDataURL(photo);
});
