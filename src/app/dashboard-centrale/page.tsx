'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";


type Squadra = {

  matricola:string;

  numeroSquadra:string;

  caposquadra:string;

  operai:string[];

  distretto:string;


};



type Assegnazione = {

  nomeDirettore:string;

  distretto:string;

  squadre:string[];

};



type Presenza = {

  nome:string;

  matricolaSquadra:string;

  stato:string;

  oraFirma:string;

  ruolo:string;

  

};





export default function DashboardSuperUser(){


const [assegnazione,setAssegnazione] =
useState<Assegnazione | null>(null);



const [squadre,setSquadre] =
useState<Squadra[]>([]);



const [presenze,setPresenze] =
useState<Presenza[]>([]);



const [caricamento,setCaricamento] =
useState(true);

const [ricerca,setRicerca] =
useState("");





// ===============================
// CARICAMENTO SUPER USER
// ===============================


const caricaSuperUser = async()=>{


try{


const elencoSquadre:Squadra[] = [];


// tutti i distretti

const distretti = [

"Distretto 1",
"Distretto 2",
"Distretto 3",
"Distretto 4",
"Distretto 5",
"Distretto 6",
"Distretto 7",
"Distretto 8",
"Distretto 9",
"Distretto 10",
"Distretto 11",
"Distretto 12",
"Distretto 13"

];



for(const distretto of distretti){


const riferimento =
collection(
db,
"squadre",
distretto,
"elenco"
);



const snapshot =
await getDocs(
riferimento
);



snapshot.docs.forEach((doc)=>{


const s =
doc.data();



elencoSquadre.push({

matricola:
s.matricola,

numeroSquadra:
s.numeroSquadra,

caposquadra:
s.caposquadra,

operai:
s.operai || [],

distretto:
distretto

});


});


}



setSquadre(
elencoSquadre
);





const presenzeRef =
collection(
db,
"presenze"
);



const presenzeSnapshot =
await getDocs(
presenzeRef
);



const elencoPresenze:Presenza[] =

presenzeSnapshot.docs.map((doc)=>{


const p =
doc.data();



return {


nome:
p.nome,


matricolaSquadra:
p.matricolaSquadra,


stato:
p.stato,


oraFirma:
p.oraFirma,


ruolo:
p.ruolo,





};



});




setPresenze(
elencoPresenze
);




setAssegnazione({

nomeDirettore:
"SUPER USER",

distretto:
"TUTTI",

squadre:[]

});



}
catch(errore){


console.error(
"Errore Super User:",
errore
);


}


};





// ===============================
// CARICAMENTO DIRETTORE
// ===============================


const caricaDirettore = async()=>{


const direttoreId =
localStorage.getItem(
"direttoreId"
);



if(!direttoreId){

return;

}



try{


const riferimento =
doc(
db,
"assegnazioniDirettori",
direttoreId
);



const documento =
await getDoc(
riferimento
);



if(!documento.exists()){

return;

}



const dati =
documento.data() as Assegnazione;



setAssegnazione(
dati
);



const elenco:Squadra[] = [];



for(
const matricola of dati.squadre
){



const squadraRef =
doc(
db,
"squadre",
dati.distretto,
"elenco",
matricola
);



const squadraDoc =
await getDoc(
squadraRef
);



if(squadraDoc.exists()){


const squadra =
squadraDoc.data();



elenco.push({

matricola:
squadra.matricola,


numeroSquadra:
squadra.numeroSquadra,


caposquadra:
squadra.caposquadra,


operai:
squadra.operai || [],

distretto:squadra.distretto,



});


}



}



setSquadre(
elenco
);






const presenzeRef =
collection(
db,
"presenze"
);



const q =
query(

presenzeRef,

where(
"distretto",
"==",
dati.distretto
)

);



const snapshot =
await getDocs(q);




const elencoPresenze:Presenza[] =

snapshot.docs.map(doc=>{


const p =
doc.data();



return {


nome:
p.nome,


matricolaSquadra:
p.matricolaSquadra,


stato:
p.stato,


oraFirma:
p.oraFirma,


ruolo:
p.ruolo


};



});



setPresenze(
elencoPresenze
);



}
catch(errore){


console.error(
"Errore direttore:",
errore
);


}


};





// ===============================
// AVVIO
// ===============================


useEffect(()=>{


const ruolo =
localStorage.getItem(
"ruolo"
);



const avvia = async()=>{


if(
ruolo === "superuser"
){


await caricaSuperUser();


}
else{


await caricaDirettore();


}



setCaricamento(false);



};



avvia();



},[]);






const trovaPresenza = (
nome:string,
matricola:string
)=>{


return presenze.find(

p=>

p.nome === nome &&

p.matricolaSquadra === matricola

);




};
const squadreFiltrate = squadre.filter((squadra) => {

  if (ricerca.trim() === "") return true;

  const testo = ricerca.toLowerCase();

  return (

    squadra.caposquadra.toLowerCase().includes(testo) ||

    squadra.numeroSquadra.toLowerCase().includes(testo) ||

    squadra.matricola.toLowerCase().includes(testo) ||

    squadra.distretto.toLowerCase().includes(testo) ||

    squadra.operai.some(operaio =>
      operaio.toLowerCase().includes(testo)
    )

  );

});
return(

<div className="min-h-screen bg-gray-100 p-6">


<div className="bg-white rounded-xl shadow p-6">



{caricamento ? (


<div className="p-6 text-xl font-bold">

Caricamento...

</div>


) : !assegnazione ? (


<div className="p-6 text-xl font-bold">

Nessuna assegnazione trovata

</div>


) : (


<>


<h1 className="text-3xl font-bold mb-4">

 <input
  type="text"
  placeholder="🔎 Cerca operaio, caposquadra, matricola o squadra..."
  value={ricerca}
  onChange={(e) => setRicerca(e.target.value)}
  className="border rounded p-3 w-full mb-6"
/>
Dashboard Super User - Tutti i Distretti

</h1>



<p>

Accesso:

<b>

{" "}

{assegnazione.nomeDirettore}

</b>

</p>



<p className="mb-6">

Distretto:

<b>

{" "}

{assegnazione.distretto}

</b>

</p>





{squadreFiltrate.map((squadra)=>(



<div

key={squadra.matricola}

className="
border
rounded-xl
p-5
mb-5
bg-green-50
"

>



<h2 className="text-xl font-bold">

👷 Squadra {squadra.numeroSquadra}

</h2>



<p>

Matricola:

<b>

{" "}

{squadra.matricola}

</b>

</p>



<p>

Caposquadra:

<b>

{" "}

{squadra.caposquadra}

</b>

</p>





<div className="mt-4">



{[

{

nome:squadra.caposquadra,

ruolo:"Caposquadra"

},


...squadra.operai.map(o=>({

nome:o,

ruolo:"Operaio"

}))


].map((persona,index)=>{



const firma =

trovaPresenza(

persona.nome,

squadra.matricola

);




return(



<div

key={index}

className="
bg-white
rounded
p-3
mb-2
border
"

>



<b>

{persona.nome}

</b>



<br />



<span>

{persona.ruolo}

</span>




<br />



{firma ? (


<span className="text-green-700">


✅ {firma.stato}

{" "}

{firma.oraFirma}


</span>


) : (


<span className="text-red-600">


❌ Nessuna firma


</span>


)}



</div>



);



})}



</div>



</div>



))}



</>


)}



</div>


</div>


);


}