// ================================
// ADMINISTRATION MEH — sans auto-chargement
// (c'est admin.html qui gère la connexion)
// ================================

let toutesLesInscriptions = [];

// ================================
// HEADERS avec token
// ================================
function authHeaders() {
  const token = localStorage.getItem("meh_token") || "";
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}

// ================================
// DÉCONNEXION (appelée depuis admin.html)
// ================================
async function deconnexion() {
  if (!confirm("Voulez-vous vous déconnecter ?")) return;

  const token = localStorage.getItem("meh_token");

  try {
    await fetch("/api/deconnexion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });
  } catch (e) { /* ignore */ }

  localStorage.removeItem("meh_token");
  location.reload();
}

// ================================
// CHARGEMENT DE LA LISTE (READ)
// ================================
async function charger() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7">Chargement...</td></tr>`;

  try {
    const r = await fetch("/api/liste", { headers: authHeaders() });

    if (r.status === 401) {
      localStorage.removeItem("meh_token");
      location.reload();
      return;
    }

    if (!r.ok) throw new Error("Erreur " + r.status);

    const data = await r.json();
    toutesLesInscriptions = Array.isArray(data) ? data : [];
    afficher(toutesLesInscriptions);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red">Erreur : ${err.message}</td></tr>`;
    console.error(err);
  }
}

// ================================
// AFFICHAGE DU TABLEAU
// ================================
function afficher(liste) {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  if (liste.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">Aucune inscription.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  liste.forEach((e, i) => {
    const tr = document.createElement("tr");
    const jsonSafe = encodeURIComponent(JSON.stringify(e));

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${e.numero || ""}</td>
      <td>${e.nom || ""}</td>
      <td>${e.prenom || ""}</td>
      <td>${e.option_formation || ""}</td>
      <td>${e.telephone || ""}</td>
      <td>
        <button onclick="pdf('${jsonSafe}')" title="Télécharger le PDF">📄</button>
        <button onclick="ouvrirModal('${jsonSafe}')" title="Modifier" style="background:#1976d2">✏️</button>
        <button onclick="supprimer(${e.id}, '${(e.nom || "")} ${(e.prenom || "")}')" title="Supprimer" style="background:#c62828">🗑️</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ================================
// RECHERCHE
// ================================
document.addEventListener("input", (ev) => {
  if (ev.target.id !== "recherche") return;
  const q = ev.target.value.toLowerCase().trim();
  if (!q) { afficher(toutesLesInscriptions); return; }

  const filtre = toutesLesInscriptions.filter(e =>
    (e.nom || "").toLowerCase().includes(q) ||
    (e.prenom || "").toLowerCase().includes(q) ||
    (e.numero || "").toLowerCase().includes(q) ||
    (e.telephone || "").toLowerCase().includes(q) ||
    (e.option_formation || "").toLowerCase().includes(q)
  );
  afficher(filtre);
});

// ================================
// MODAL : OUVRIR
// ================================
function ouvrirModal(jsonSafe) {
  const e = JSON.parse(decodeURIComponent(jsonSafe));

  document.getElementById("edit-id").value = e.id || "";
  document.getElementById("edit-nom").value = e.nom || "";
  document.getElementById("edit-prenom").value = e.prenom || "";
  document.getElementById("edit-sexe").value = e.sexe || "";
  document.getElementById("edit-naissance").value = e.naissance || "";
  document.getElementById("edit-lieu").value = e.lieu || "";
  document.getElementById("edit-adresse").value = e.adresse || "";
  document.getElementById("edit-telephone").value = e.telephone || "";
  document.getElementById("edit-email").value = e.email || "";
  document.getElementById("edit-option").value = e.option_formation || "";
  document.getElementById("edit-parent").value = e.parent || "";
  document.getElementById("edit-tel-parent").value = e.tel_parent || "";

  document.getElementById("modal").classList.add("visible");
}

function fermerModal() {
  document.getElementById("modal").classList.remove("visible");
}

window.addEventListener("click", (ev) => {
  const modal = document.getElementById("modal");
  if (ev.target === modal) fermerModal();
});

// ================================
// SAUVEGARDER MODIFICATION (UPDATE)
// ================================
async function sauvegarderModif(ev) {
  ev.preventDefault();

  const data = {
    id: document.getElementById("edit-id").value,
    nom: document.getElementById("edit-nom").value,
    prenom: document.getElementById("edit-prenom").value,
    sexe: document.getElementById("edit-sexe").value,
    naissance: document.getElementById("edit-naissance").value,
    lieu: document.getElementById("edit-lieu").value,
    adresse: document.getElementById("edit-adresse").value,
    telephone: document.getElementById("edit-telephone").value,
    email: document.getElementById("edit-email").value,
    option_formation: document.getElementById("edit-option").value,
    parent: document.getElementById("edit-parent").value,
    tel_parent: document.getElementById("edit-tel-parent").value
  };

  try {
    const r = await fetch("/api/modifier", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data)
    });

    const res = await r.json();
    if (!r.ok) throw new Error(res.error || "Erreur");

    fermerModal();
    charger();
    alert("✅ Modification enregistrée !");

  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

// ================================
// SUPPRIMER (DELETE)
// ================================
async function supprimer(id, nom) {
  const ok = confirm(`⚠️ Supprimer définitivement l'inscription de "${nom}" ?`);
  if (!ok) return;

  try {
    const r = await fetch("/api/supprimer", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ id })
    });

    const res = await r.json();
    if (!r.ok) throw new Error(res.error || "Erreur");

    charger();
    alert("✅ Inscription supprimée !");

  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
}

// ================================
// PDF — photo en haut à droite
// ================================
async function pdf(jsonSafe) {
  const e = JSON.parse(decodeURIComponent(jsonSafe));
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const ROUGE = [139, 0, 0];

  doc.setFillColor(...ROUGE);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MARANATHA ÉCOLE HÔTELIÈRE", 105, 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("& SERVICE TRAITEUR", 105, 21, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("FICHE D'INSCRIPTION", 105, 45, { align: "center" });

  doc.setDrawColor(...ROUGE);
  doc.setLineWidth(0.6);
  doc.rect(55, 52, 100, 12);
  doc.setTextColor(...ROUGE);
  doc.setFontSize(12);
  doc.text("N° " + (e.numero || ""), 105, 60, { align: "center" });

  const PHOTO_X = 148, PHOTO_W = 48, PHOTO_Y = 76;

  let y = 78;
  doc.setTextColor(...ROUGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INFORMATIONS PERSONNELLES", 20, y);
  doc.setDrawColor(...ROUGE);
  doc.line(20, y + 2, 140, y + 2);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  const ligne = (label, valeur, maxWidth) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + " :", 20, y);
    doc.setFont("helvetica", "normal");
    const texte = String(valeur || "-");
    if (maxWidth) {
      const wrapped = doc.splitTextToSize(texte, maxWidth);
      doc.text(wrapped, 72, y);
      y += wrapped.length * 6 + 2;
    } else {
      doc.text(texte, 72, y);
      y += 8;
    }
  };

  ligne("Nom", e.nom);
  ligne("Prénom", e.prenom);
  ligne("Sexe", e.sexe);
  ligne("Date de naissance", e.naissance);
  ligne("Lieu de naissance", e.lieu);
  ligne("Adresse", e.adresse, 60);
  ligne("Téléphone", e.telephone);
  ligne("Email", e.email, 60);

  const PHOTO_ZONE_H = Math.max(y - PHOTO_Y - 4, 60);

  if (e.photo_piece && typeof e.photo_piece === "string" && e.photo_piece.startsWith("data:image")) {
    try {
      const dims = await getImageDimensions(e.photo_piece);
      const format = e.photo_piece.includes("png") ? "PNG" : "JPEG";
      let w = PHOTO_W, h = PHOTO_ZONE_H;
      if (dims && dims.w && dims.h) {
        const ratio = dims.w / dims.h;
        if (PHOTO_W / PHOTO_ZONE_H > ratio) { h = PHOTO_ZONE_H; w = PHOTO_ZONE_H * ratio; }
        else { w = PHOTO_W; h = PHOTO_W / ratio; }
      }
      const photoX = PHOTO_X + (PHOTO_W - w) / 2;
      doc.setDrawColor(...ROUGE);
      doc.setLineWidth(0.6);
      doc.rect(photoX - 1.5, PHOTO_Y - 1.5, w + 3, h + 3);
      doc.addImage(e.photo_piece, format, photoX, PHOTO_Y, w, h);
    } catch (err) { console.warn("Photo non ajoutée :", err); }
  } else {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.rect(PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_ZONE_H);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Photo", PHOTO_X + PHOTO_W / 2, PHOTO_Y + PHOTO_ZONE_H / 2 - 3, { align: "center" });
    doc.text("non fournie", PHOTO_X + PHOTO_W / 2, PHOTO_Y + PHOTO_ZONE_H / 2 + 3, { align: "center" });
  }

  y += 4;
  doc.setTextColor(...ROUGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FORMATION CHOISIE", 20, y);
  doc.setDrawColor(...ROUGE);
  doc.line(20, y + 2, 190, y + 2);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const formation = doc.splitTextToSize(String(e.option_formation || "-"), 170);
  doc.text(formation, 20, y);
  y += formation.length * 6 + 6;

  doc.setTextColor(...ROUGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PARENT OU TUTEUR", 20, y);
  doc.line(20, y + 2, 190, y + 2);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  ligne("Nom", e.parent);
  ligne("Téléphone", e.tel_parent);

  doc.setFillColor(...ROUGE);
  doc.rect(0, 275, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.text("Slogan : Former pour agir", 105, 284, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const dateInsc = e.date_inscription
    ? new Date(e.date_inscription).toLocaleDateString("fr-FR")
    : new Date().toLocaleDateString("fr-FR");
  doc.text("Inscrit le " + dateInsc, 105, 291, { align: "center" });

  doc.save((e.numero || "fiche") + ".pdf");
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
