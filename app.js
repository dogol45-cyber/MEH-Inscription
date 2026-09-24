document.getElementById("form")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const f=e.target;

const data={
nom:f.nom.value,
prenom:f.prenom.value,
sexe:f.sexe.value,
naissance:f.naissance.value,
lieu:f.lieu.value,
adresse:f.adresse.value,
telephone:f.telephone.value,
email:f.email.value,
parent:f.parent.value,
tel_parent:f.tel_parent.value,
option:f.option.value,
photo_piece:""
};

const r=await fetch("/api/inscription",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

const rep=await r.json();

alert(
"Inscription réussie !\nNuméro : "
+rep.numero
);

f.reset();

});
