'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion
} from "firebase/firestore";

export default function GestionePresenze(){

const router = useRouter();


const [nomeRicerca,setNomeRicerca] =
useState("");

const [matricolaRicerca,setMatricolaRicerca] =
useState("");

const [distrettoRicerca,setDistrettoRicerca] =
useState("");

const [risultati,setRisultati] =
useState<any[]>([]);

const [operaioSelezionato,setOperaioSelezionato] =
useState<any>(null);

const [presenzeOperaio,setPresenzeOperaio] =
useState<any[]>([]);

const [presenzaModifica,setPresenzaModifica] =
useState<any>(null);

const [nuovoStato,setNuovoStato] =
useState("");

const [nuoveOre,setNuoveOre] =
useState(0);

const [nuovaSquadra,setNuovaSquadra] =
useState("");

const [nuovoDistretto,setNuovoDistretto] =
useState("");

const [nuoviKm,setNuoviKm] =
useState("");

const [nuovoPermesso,setNuovoPermesso] =
useState("");

const [nuoveOrePermesso,setNuoveOrePermesso] =
useState(0);

const [operaioSposta,setOperaioSposta] =
useState("");

const [squadraAttuale,setSquadraAttuale] =
useState("");

const [listaSquadre,setListaSquadre] =
useState<any[]>([]);

const [nuovaDataInizio,setNuovaDataInizio] =
useState("");

const [nuovaDataFine,setNuovaDataFine] =
useState("");

const spostaOperaio = async()=>{


if(
!operaioSposta ||
!nuovaSquadra
){

alert(
"Inserire operaio e nuova squadra"
);

return;

}



try{


let squadraVecchia:any = null;



// cerchiamo dove si trova l'operaio

for(
const squadra of listaSquadre
){


if(
squadra.operai?.includes(
operaioSposta
)
){


squadraVecchia =
squadra;


break;

}


}





if(!squadraVecchia){


alert(
"Operaio non trovato in nessuna squadra"
);


return;


}





// rimuove dalla vecchia squadra

await updateDoc(

doc(
db,
"squadre",
squadraVecchia.id
),

{

operai:
arrayRemove(
operaioSposta
)

}

);





// aggiunge alla nuova squadra

// trova la squadra scelta nel menu

const squadraNuova =
listaSquadre.find(
(squadra)=>
squadra.id === nuovaSquadra
);


if(!squadraNuova){

alert(
"Squadra destinazione non trovata"
);

return;

}


// aggiunge l'operaio alla nuova squadra

await updateDoc(

doc(
 db,
 "squadre",
 squadraNuova.distretto,
 "elenco",
 squadraNuova.id
),

{

operai:
arrayUnion(
operaioSposta
)

}

);


alert(
"Operaio spostato correttamente"
);



caricaSquadre();



setOperaioSposta("");

setNuovaSquadra("");


}
catch(errore){


console.error(
"Errore spostamento operaio:",
errore
);


alert(
"Errore durante lo spostamento"
);


}


};

const salvaModifica = async()=>{


if(!presenzaModifica){

return;

}


try{


const riferimento =
doc(
db,
"presenze",
presenzaModifica.id
);



await updateDoc(

riferimento,

{

stato:
nuovoStato,


oreLavorate:
nuoveOre,


matricolaSquadra:
nuovaSquadra,


distretto:
nuovoDistretto,


chilometri:
nuoviKm,


tipoPermesso:
nuovoPermesso,

orePermesso:
nuovoStato === "Permesso"
?
nuoveOrePermesso
:
0,

dataInizio:
nuovoStato === "Ferie" ||
nuovoStato === "Malattia"
? nuovaDataInizio
: "",

dataFine:
nuovoStato === "Ferie" ||
nuovoStato === "Malattia"
? nuovaDataFine
: "",

}

);

alert(
"Presenza modificata correttamente"
);

caricaPresenzeOperaio(operaioSelezionato);

setPresenzaModifica(null);


}
catch(errore){

console.error(
"Errore salvataggio:",
errore
);


alert(
"Errore durante il salvataggio"
);


}


};

const caricaSquadre = async()=>{

try{

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
"Distretto 11"
];


let elencoSquadre:any[] = [];


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


elencoSquadre.push({

id: doc.id,

distretto: distretto,

...doc.data()

});


});


}



console.log(
"Squadre trovate:",
elencoSquadre
);



setListaSquadre(
elencoSquadre
);



}
catch(errore){

console.error(
"Errore caricamento squadre:",
errore
);

}

};
const caricaPresenzeOperaio = async(operaio:any)=>{


try{


const riferimento =
collection(
db,
"presenze"
);



const q =
query(

riferimento,

where(
"matricolaSquadra",
"==",
operaio.matricolaSquadra
)

);



const snapshot =
await getDocs(q);



const dati =
snapshot.docs.map((doc)=>({

id:doc.id,

...doc.data()

}));



setPresenzeOperaio(dati);



}
catch(errore){

console.error(
"Errore caricamento presenze operaio:",
errore
);


setPresenzeOperaio([]);


}


};
const cercaOperaio = async()=>{


console.log("RICERCA AVVIATA");

console.log(
"Distretto selezionato:",
distrettoRicerca
);


try{


const riferimento =
collection(
db,
"presenze"
);



const q =
query(

riferimento,

where(
"distretto",
"==",
distrettoRicerca
)

);



const snapshot =
await getDocs(q);



console.log(
"Documenti trovati:",
snapshot.size
);



const tutti = snapshot.docs.map((doc)=>({

id:doc.id,

...doc.data()

}));

const unici:any[] = [];

const visti = new Set();

tutti.forEach((operaio:any)=>{

const chiave =
operaio.nome +
"_" +
operaio.matricolaSquadra;

if(!visti.has(chiave)){

visti.add(chiave);

unici.push(operaio);

}

});

setRisultati(unici);


}
catch(errore){

console.error(
"Errore ricerca:",
errore
);


setRisultati([]);


}


};

useEffect(()=>{


const accesso =
localStorage.getItem(
"accessoAmministrazione"
);


if(accesso !== "true"){

router.push(
"/accesso-amministrazione"
);

}


caricaSquadre();


},[router]);


return(

<div className="min-h-screen bg-gray-100 p-6">


<div className="bg-white rounded-xl shadow p-6 max-w-5xl mx-auto">



<h1 className="text-3xl font-bold mb-6 text-center">

🔐 Gestione Amministrativa Presenze

</h1>





<div>


<h2 className="text-xl font-bold">

Area Amministratore

</h2>

<div className="mt-8 p-4 border rounded bg-gray-50">


<h2 className="text-xl font-bold mb-4">

🔧 Gestione Squadre

</h2>



<label className="block font-bold">

Nome Operaio

</label>


<input

type="text"

value={operaioSposta}

onChange={(e)=>
setOperaioSposta(e.target.value)
}

placeholder="Nome operaio"

className="border rounded p-2 w-full"

/>



<label className="block mt-4 font-bold">

Nuova Squadra

</label>


<select

value={nuovaSquadra}

onChange={(e)=>
setNuovaSquadra(e.target.value)
}

className="border rounded p-2 w-full"

>


<option value="">

Seleziona squadra

</option>


{

listaSquadre.map((squadra)=>(

<option

key={squadra.id}

value={squadra.id}

>

{

"SQ "

+

squadra.numeroSquadra

+

" - "

+

squadra.caposquadra

}

</option>

))

}


</select>



<button

onClick={spostaOperaio}

className="
mt-4
bg-purple-600
text-white
font-bold
px-6
py-3
rounded
"

>

💾 Sposta Operaio

</button>


</div>





<div className="mt-6">


<h2 className="text-xl font-bold mb-4">

🔎 Ricerca Operaio

</h2>





<div className="grid grid-cols-1 md:grid-cols-3 gap-4">





<input

type="text"

value={nomeRicerca}

onChange={(e)=>
setNomeRicerca(e.target.value)
}

placeholder="Nome o Cognome"

className="
border
rounded
p-3
"

/>






<input

type="text"

value={matricolaRicerca}

onChange={(e)=>
setMatricolaRicerca(e.target.value)
}

placeholder="Matricola"

className="
border
rounded
p-3
"

/>







<select

value={distrettoRicerca}

onChange={(e)=>
setDistrettoRicerca(e.target.value)
}

className="
border
rounded
p-3
"

>


<option value="">

Seleziona Distretto

</option>


<option value="Distretto 1">

Distretto 1

</option>


<option value="Distretto 2">

Distretto 2

</option>


<option value="Distretto 3">

Distretto 3

</option>


<option value="Distretto 11">

Distretto 11

</option>

<option value="Distretto 13">

Distretto 13

</option>


</select>





</div>






<button

onClick={()=>{

cercaOperaio();

}}


className="
mt-4
bg-blue-600
hover:bg-blue-700
text-white
font-bold
px-6
py-3
rounded
"

>

🔎 Cerca

</button>


</div>

{operaioSelezionato && (

<div className="mt-6 p-4 bg-gray-100 rounded">


<h2 className="text-xl font-bold">

Operaio selezionato

</h2>


<p>

Nome:
{operaioSelezionato.nome}

</p>


<p>

Matricola:
{operaioSelezionato.matricolaSquadra}

</p>


<p>

Distretto:
{operaioSelezionato.distretto}

</p>
<hr className="my-4"/>


<h3 className="text-lg font-bold mb-3">

Presenze trovate:

</h3>



<table className="border-collapse border w-full">


<thead>

<tr>

<th className="border p-2">
Giorno
</th>


<th className="border p-2">
Stato
</th>


<th className="border p-2">
Ore
</th>

<th className="border p-2">
Azione
</th>


</tr>

</thead>



<tbody>


{

presenzeOperaio.map((presenza,index)=>(


<tr key={index}>


<td className="border p-2">

{presenza.giorno}/{presenza.mese}/{presenza.anno}

</td>


<td className="border p-2">

{presenza.stato}

</td>


<td className="border p-2">

{presenza.oreLavorate || 0}

</td>

<td className="border p-2">


<button

onClick={()=>{

setPresenzaModifica(presenza);

setNuovoStato(
presenza.stato
);

console.log("Documento:", presenza);

console.log("oreLavorate:", presenza.oreLavorate);

console.log("tipo:", typeof presenza.oreLavorate);

setNuoveOre(
presenza.oreLavorate || 0
);

setNuovaSquadra(
presenza.matricolaSquadra || ""
);


setNuovoDistretto(
presenza.distretto || ""
);


setNuoviKm(
presenza.chilometri || ""
);


setNuovoPermesso(
presenza.tipoPermesso || ""
);

setNuoveOrePermesso(
presenza.orePermesso || 0
);

setNuovaDataInizio(
presenza.dataInizio || ""
);

setNuovaDataFine(
presenza.dataFine || ""
);

}}

className="
bg-yellow-500
text-white
px-3
py-1
rounded
"

>

✏️ Modifica

</button>


</td>


</tr>


))


}


</tbody>


</table>

{presenzaModifica && (

<div className="mt-6 p-4 border rounded bg-gray-50">


<h3 className="text-xl font-bold mb-4">

✏️ Modifica Presenza

</h3>



<p>

Giorno:

{presenzaModifica.giorno}/
{presenzaModifica.mese}/
{presenzaModifica.anno}

</p>



<p className="mt-2">

Documento:

{presenzaModifica.id}

</p>



<label className="block mt-4 font-bold">
Stato
</label>

<select
value={nuovoStato}
onChange={(e)=>setNuovoStato(e.target.value)}
className="border rounded p-2 w-full"
>

<option value="Presenza">
Presenza
</option>

<option value="Ferie">
Ferie
</option>

<option value="Malattia">
Malattia
</option>

<option value="Permesso">
Permesso
</option>

</select>


{(nuovoStato === "Ferie" ||
nuovoStato === "Malattia") && (

<>

<label className="block mt-4 font-bold">
Data Inizio
</label>

<input
type="date"
value={nuovaDataInizio}
onChange={(e)=>setNuovaDataInizio(e.target.value)}
className="border rounded p-2 w-full"
/>

<label className="block mt-4 font-bold">
Data Fine
</label>

<input
type="date"
value={nuovaDataFine}
onChange={(e)=>setNuovaDataFine(e.target.value)}
className="border rounded p-2 w-full"
/>

</>

)}

<label className="block mt-4 font-bold">
Ore lavorate
</label>

<input

type="number"

value={nuoveOre}

onChange={(e)=>
setNuoveOre(
Number(e.target.value)
)
}

className="border rounded p-2 w-full"

/>

<label className="block mt-4 font-bold">
Chilometri
</label>

<input

type="text"

value={nuoviKm}

onChange={(e)=>
setNuoviKm(e.target.value)
}

className="border rounded p-2 w-full"

/>



<label className="block mt-4 font-bold">

Tipo Permesso

</label>


<input

type="text"

value={nuovoPermesso}

onChange={(e)=>
setNuovoPermesso(e.target.value)
}

className="border rounded p-2 w-full"

/>

{nuovoStato === "Permesso" && (

<>

<label className="block mt-4 font-bold">

Ore Permesso

</label>


<input

type="number"

min="0"

value={nuoveOrePermesso}

onChange={(e)=>
setNuoveOrePermesso(
Number(e.target.value)
)
}

className="border rounded p-2 w-full"

/>

</>

)}



<button

onClick={salvaModifica}

className="
mt-4
bg-green-600
text-white
px-5
py-2
rounded
"

>

💾 Salva modifica

</button>

</div>

)}

</div>

)}

{risultati.length > 0 && (

<div className="mt-8">


<h2 className="text-xl font-bold mb-4">

Risultati trovati

</h2>



<div className="overflow-auto">


<table className="border-collapse border w-full">


<thead>

<tr>


<th className="border p-2">
Nome
</th>


<th className="border p-2">
Matricola
</th>


<th className="border p-2">
Distretto
</th>

<th className="border p-2">
Azioni
</th>


</tr>

</thead>



<tbody>


{
risultati.map((operaio,index)=>(


<tr key={index}>


<td className="border p-2">

{operaio.nome}

</td>



<td className="border p-2">

{operaio.matricolaSquadra}

</td>



<td className="border p-2">

{operaio.distretto}

</td>

<td className="border p-2">


<button

onClick={()=>{

setOperaioSelezionato(operaio);

caricaPresenzeOperaio(operaio);

}}

className="
bg-green-600
text-white
px-3
py-1
rounded
"

>

✏️ Apri

</button>
</td>



</tr>


))
}


</tbody>


</table>


</div>


</div>

)}





</div>





</div>


</div>


);

}