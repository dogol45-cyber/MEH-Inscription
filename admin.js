// ================================
// ADMINISTRATION MEH
// Liste + PDF complet avec photo
// ================================

async function charger() {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = `<tr><td colspan="7">Chargement...</td></tr>`;

  try {
    const r = await fetch("/api/liste");
    if (!r.ok) throw new Error("Erreur " + r.status);

    const data = await r.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">Aucune inscription pour le moment.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    data.forEach((e, i) => {
      const tr = document.createElement("tr");

      // On passe tout l'objet en JSON (sécurisé)
      const jsonSafe = encodeURIComponent(JSON.stringify(e));

      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${e.numero || ""}</td>
        <td>${e.nom || ""}</td>
        <td>${e.prenom || ""}</td>
        <td>${e.option_formation || ""}</td>
        <td>${e.telephone || ""}</td>
        <td>
          <button onclick="pdf('${jsonSafe}')">PDF</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red">Erreur : ${err.message}</td></tr>`;
    console.error(err);
  }
}

// ================================
// PDF COMPLET
// ================================
async function pdf(jsonSafe) {
  const e = JSON.parse(decodeURIComponent(jsonSafe));
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const ROUGE = [139, 0, 0];

  // ---------- EN-TÊTE ----------
  doc.setFillColor(...ROUGE);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MARANATHA ÉCOLE HÔTELIÈRE", 105, 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("& SERVICE TRAITEUR", 105, 21, { align: "center" });

  // ---------- TITRE ----------
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("FICHE D'INSCRIPTION", 105, 45, { align: "center" });

  // ---------- NUMÉRO ----------
  doc.setDrawColor(...ROUGE);
  doc.setLineWidth(0.6);
  doc.rect(55, 52, 100, 12);
  doc.setTextColor(...ROUGE);
  doc.setFontSize(12);
  doc.text("N° " + (e.numero || ""), 105, 60, { align: "center" });

  // ---------- PHOTO (en haut à droite) ----------
  let photoAjoutee = false;
  if (e.photo_piece && typeof e.photo_piece === "string" && e.photo_piece.startsWith("data:image")) {
    try {
      const format = e.photo_piece.includes("png") ? "PNG" : "JPEG";
      doc.addImage(e.photo_piece, format, 155, 40, 40, 50);
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.rect(155, 40, 40, 50);
      photoAjoutee = true;
    } catch (err) {
      console.warn("Photo non ajoutée :", err);
    }
  }

  // ---------- SECTION : INFOS PERSONNELLES ----------
  let y = 78;
  doc.setTextColor(...ROUGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INFORMATIONS PERSONNELLES", 20, y);
  doc.setDrawColor(...ROUGE);
  doc.line(20, y + 2, 190, y + 2);
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
      doc.text(wrapped, 75, y);
      y += wrapped.length * 6 + 2;
    } else {
      doc.text(texte, 75, y);
      y += 8;
    }
  };

  ligne("Nom", e.nom);
  ligne("Prénom", e.prenom);
  ligne("Sexe", e.sexe);
  ligne("Date de naissance", e.naissance);
  ligne("Lieu de naissance", e.lieu);
  ligne("Adresse", e.adresse, 110);
  ligne("Téléphone", e.telephone);
  ligne("Email", e.email, 110);

  // ---------- SECTION : FORMATION ----------
  y += 4;
  doc.setTextColor(...ROUGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FORMATION CHOISIE", 20, y);
  doc.line(20, y + 2, 190, y + 2);
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const formation = doc.splitTextToSize(String(e.option_formation || "-"), 160);
  doc.text(formation, 20, y);
  y += formation.length * 6 + 6;

  // ---------- SECTION : PARENT / TUTEUR ----------
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

  // ---------- MENTION PHOTO SI ABSENTE ----------
  if (!photoAjoutee && e.photo_piece) {
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("(Photo non disponible dans un format affichable)", 105, 265, { align: "center" });
  }

  // ---------- PIED DE PAGE ----------
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

  // ---------- SAUVEGARDE ----------
  doc.save((e.numero || "fiche") + ".pdf");
}

// Lancement
charger();
