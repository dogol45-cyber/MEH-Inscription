// ================================
// ADMINISTRATION MEH
// Chargement des inscriptions + PDF
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

      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${e.numero || ""}</td>
        <td>${e.nom || ""}</td>
        <td>${e.prenom || ""}</td>
        <td>${e.option_formation || ""}</td>
        <td>${e.telephone || ""}</td>
        <td>
          <button onclick='pdf(${JSON.stringify(e).replace(/'/g, "&#39;")})'>
            PDF
          </button>
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
// GÉNÉRATION DU PDF
// ================================
function pdf(e) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const ROUGE = [139, 0, 0];

  // --- En-tête bordeaux ---
  doc.setFillColor(...ROUGE);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("MARANATHA ÉCOLE HÔTELIÈRE", 105, 13, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("& SERVICE TRAITEUR", 105, 21, { align: "center" });

  // --- Titre ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("FICHE D'INSCRIPTION", 105, 45, { align: "center" });

  // --- Numéro en évidence ---
  doc.setDrawColor(...ROUGE);
  doc.setLineWidth(0.5);
  doc.rect(60, 52, 90, 12);
  doc.setFontSize(12);
  doc.setTextColor(...ROUGE);
  doc.text("N° " + (e.numero || ""), 105, 60, { align: "center" });

  // --- Infos personnelles ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMATIONS PERSONNELLES", 20, 78);
  doc.line(20, 80, 190, 80);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 90;
  const ligne = (label, valeur) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + " :", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(valeur || "-"), 80, y);
    y += 8;
  };

  ligne("Nom", e.nom);
  ligne("Prénom", e.prenom);
  ligne("Sexe", e.sexe);
  ligne("Date de naissance", e.naissance);
  ligne("Lieu de naissance", e.lieu);
  ligne("Adresse", e.adresse);
  ligne("Téléphone", e.telephone);
  ligne("Email", e.email);

  // --- Formation ---
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FORMATION CHOISIE", 20, y);
  doc.line(20, y + 2, 190, y + 2);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(String(e.option_formation || "-"), 20, y);

  // --- Parent / tuteur ---
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PARENT OU TUTEUR", 20, y);
  doc.line(20, y + 2, 190, y + 2);
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.setFont("helvetica", "bold");
  doc.text("Nom :", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(e.parent_nom || "-"), 80, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Téléphone :", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(e.parent_tel || "-"), 80, y);

  // --- Pied de page ---
  doc.setFillColor(...ROUGE);
  doc.rect(0, 275, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.text("Slogan : Former pour agir", 105, 285, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Document généré le " + new Date().toLocaleDateString("fr-FR"),
    105,
    292,
    { align: "center" }
  );

  // --- Sauvegarde ---
  doc.save((e.numero || "fiche") + ".pdf");
}

// Lancer le chargement au démarrage
charger();
