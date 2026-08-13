'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";

import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";



type Presenza = {

  nome: string;

  matricolaSquadra: string;

  distretto: string;

  giorno: number;

  mese: number;

  anno: number;

  stato: string;

  oreLavorate?: number;

  tipoPermesso?: string;

  chilometri?: string;

  giorniMalattia?: number;

giorniCarenza?: number;

giorniMalattia50?: number;

giorniMalattia66?: number;

orePermesso?: number;



};



type RigaCartellino = {


  nome: string;

  cognome: string;

  matricolaSquadra: string;



  giorni:{
    [key:number]:string;
  };



  totaleOre:number;



  ferie:number;
  ferieMaturate:number;

ferieUsate:number;

saldoFerie:number;



  malattia:number;

  carenza:number;

  malattia50:number;

  malattia66:number;



  permessoRetribuito:number;

  art51:number;

  art20:number;

  legge104:number;

  orePermessoRetribuito:number;

oreArt51:number;

oreArt20:number;

giorniLegge104:number;

oreFestivitaSoppresse:number;

  festivitaSoppresse:number;

  permessoElettorale:number;

  permessoPioggia:number;

  permessoLutto:number;

  visitaMedica:number;

  aspettativa:number;

  congedoParentale:number;

  permessoSindacale:number;

  permessoServizio:number;

  lavoriDisagiati:number;



  km0_10:number;

  km11_20:number;

  km21_30:number;

  km31_40:number;

  km41_50:number;

  km51_60:number;

  km61_90:number;

  km91_120:number;

  kmOltre120:number;



};



const giorniMese =
Array.from(
 {length:31},
 (_,i)=>i+1
);



const distretti =
Array.from(
 {length:15},
 (_,i)=>`Distretto ${i+1}`
);





export default function CartellinoDistretto(){



const [distretto,setDistretto] =
useState("Distretto 11");



const [mese,setMese] =
useState(7);



const [anno,setAnno] =
useState(2026);



const [righe,setRighe] =
useState<RigaCartellino[]>([]);



const [caricamento,setCaricamento] =
useState(false);







const caricaCartellino = async()=>{


setCaricamento(true);



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
distretto
),


where(
"mese",
"==",
mese
),


where(
"anno",
"==",
anno
)

);




const snapshot =
await getDocs(q);
const qFerie =
query(

  collection(
    db,
    "ferie"
  ),

  where(
    "anno",
    "==",
    anno
  )

);


const snapshotFerie =
await getDocs(qFerie);






const persone:
{
[key:string]:RigaCartellino
}
={};






snapshot.docs.forEach((documento)=>{


const dati = documento.data() as Presenza;




const chiave =
dati.nome+
"_"+
dati.matricolaSquadra;







if(!persone[chiave]){



const parti =
dati.nome
.trim()
.split(" ");



const nome =
parti.pop() || "";



const cognome =
parti.join(" ");





persone[chiave]={


nome,

cognome,


matricolaSquadra:
dati.matricolaSquadra,



giorni:{},


totaleOre:0,


ferie:0,
ferieMaturate:0,

ferieUsate:0,

saldoFerie:0,


malattia:0,

carenza:0,

malattia50:0,

malattia66:0,



permessoRetribuito:0,

art51:0,

art20:0,

legge104:0,

festivitaSoppresse:0,

orePermessoRetribuito:0,

oreArt51:0,

oreArt20:0,

giorniLegge104:0,

oreFestivitaSoppresse:0,

permessoElettorale:0,

permessoPioggia:0,

permessoLutto:0,

visitaMedica:0,

aspettativa:0,

congedoParentale:0,

permessoSindacale:0,

permessoServizio:0,

lavoriDisagiati:0,





km0_10:0,

km11_20:0,

km21_30:0,

km31_40:0,

km41_50:0,

km51_60:0,

km61_90:0,

km91_120:0,

kmOltre120:0


};


}





// =====================
// GIORNI MENSILI
// =====================


let simbolo="";


switch(dati.stato){


case "Presenza":

simbolo="P";

break;



case "Ferie":

simbolo="F";

break;



case "Malattia":

simbolo="M";

break;



case "Permessi Vari":

simbolo="PR";

break;



default:

simbolo=dati.stato;


}



persone[chiave]
.giorni[dati.giorno]
=
simbolo;






// ORE

persone[chiave]
.totaleOre +=
dati.oreLavorate || 0;






// =====================
// FERIE
// =====================


if(dati.stato==="Ferie"){

persone[chiave].ferie++;

}






// =====================
// MALATTIA
// =====================


if(dati.stato==="Malattia"){

  persone[chiave].malattia++;


  // primi 3 giorni
  if(persone[chiave].malattia <= 3){

    persone[chiave].carenza++;

  }

  // dal 4° giorno fino al periodo previsto
  else if(persone[chiave].malattia <= 180){

    persone[chiave].malattia50++;

  }

  // oltre il periodo previsto
  else{

    persone[chiave].malattia66++;

  }

}




// =====================
// PERMESSI
// =====================


const permesso =
(dati.tipoPermesso || "")
.toUpperCase();




if(permesso.includes("PERMESSO RETRIBUITO")){

  persone[chiave].permessoRetribuito++;

  persone[chiave].orePermessoRetribuito +=
    dati.orePermesso || 0;

}


if(permesso.includes("ART 51")){

  persone[chiave].art51++;

  persone[chiave].oreArt51 +=
    dati.orePermesso || 0;

}


if(permesso.includes("ART.20")){

  persone[chiave].art20++;

  persone[chiave].oreArt20 +=
    dati.orePermesso || 0;

}

if(permesso.includes("LEGGE 104")){

  persone[chiave].legge104++;

  persone[chiave].giorniLegge104++;

}


if(permesso.includes("FESTIVITA")){

  persone[chiave].festivitaSoppresse++;

  persone[chiave].oreFestivitaSoppresse +=
    dati.orePermesso || 0;

}


if(permesso.includes("ELETTORALE")){

persone[chiave]
.permessoElettorale++;

}


if(permesso.includes("PIOGGIA")){

persone[chiave]
.permessoPioggia++;

}


if(permesso.includes("LUTTO")){

persone[chiave]
.permessoLutto++;

}


if(permesso.includes("VISITA")){

persone[chiave]
.visitaMedica++;

}


if(permesso.includes("ASPETTATIVA")){

persone[chiave]
.aspettativa++;

}


if(permesso.includes("CONGEDO")){

persone[chiave]
.congedoParentale++;

}


if(permesso.includes("SINDACALE")){

persone[chiave]
.permessoSindacale++;

}


if(permesso.includes("SERVIZIO")){

persone[chiave]
.permessoServizio++;

}


if(permesso.includes("DISAGIATI")){

persone[chiave]
.lavoriDisagiati++;

}






// =====================
// FASCE KM
// =====================


const km =
Number(
dati.chilometri || 0
);



if(km<=10)
persone[chiave].km0_10++;


else if(km<=20)
persone[chiave].km11_20++;


else if(km<=30)
persone[chiave].km21_30++;


else if(km<=40)
persone[chiave].km31_40++;


else if(km<=50)
persone[chiave].km41_50++;


else if(km<=60)
persone[chiave].km51_60++;


else if(km<=90)
persone[chiave].km61_90++;


else if(km<=120)
persone[chiave].km91_120++;


else
persone[chiave].kmOltre120++;




});

// =====================
// SALDI FERIE FIREBASE
// =====================


snapshotFerie.docs.forEach((documento)=>{


  const datiFerie =
    documento.data();


 const persona =
  Object.values(persone)
  .find(
    (p)=>
      p.cognome + " " + p.nome
      ===
      datiFerie.nome
  );


  if(persona){


    persona.ferieMaturate =
      Number(
        datiFerie.ferieMaturate
      ) || 0;


    persona.ferieUsate =
      Number(
        datiFerie.ferieUsate
      ) || 0;


    persona.saldoFerie =
      Number(
        datiFerie.saldoFerie
      ) || 0;


  }


});



setRighe(
Object.values(persone)
);



}

catch(errore){


console.error(
"Errore caricamento cartellino:",
errore
);


setRighe([]);


}



setCaricamento(false);


};

useEffect(()=>{

  caricaCartellino();

},[
  distretto,
  mese,
  anno
]);







return(

<div className="min-h-screen bg-gray-100 p-6">


<div className="bg-white rounded-xl shadow p-6 overflow-hidden">



<h1 className="text-3xl font-bold mb-6">

📋 Cartellino Distretto

</h1>





<div className="flex gap-4 mb-6">


<select

value={distretto}

onChange={
(e)=>setDistretto(e.target.value)
}

className="border rounded p-2"

>


{
distretti.map(d=>(

<option
key={d}
value={d}
>

{d}

</option>

))
}


</select>





<input

type="number"

value={mese}

onChange={
(e)=>setMese(
Number(e.target.value)
)
}

className="border rounded p-2 w-24"

/>





<input

type="number"

value={anno}

onChange={
(e)=>setAnno(
Number(e.target.value)
)
}

className="border rounded p-2 w-28"

/>



</div>







{
caricamento &&
<p>
Caricamento...
</p>
}






<div className="overflow-auto">


<table className="border-collapse border text-sm">


<thead>


<tr>



<th className="border p-2">
Matricola
</th>



<th className="border p-2">
Cognome
</th>



<th className="border p-2">
Nome
</th>






{
giorniMese.map(g=>(

<th
key={g}
className="border p-2"
>

{
String(g)
.padStart(2,"0")
}

</th>

))
}






<th className="border p-2">
Ore
</th>


<th className="border p-2">
Ferie
</th>

<th className="border p-2">
Ferie Maturate
</th>


<th className="border p-2">
Ferie Usate
</th>


<th className="border p-2">
Saldo Ferie
</th>


<th className="border p-2">
Malattia
</th>


<th className="border p-2">
Carenza
</th>


<th className="border p-2">
Malattia 50%
</th>


<th className="border p-2">
Malattia 66%
</th>





<th className="border p-2">
Perm. Retr.
</th>


<th className="border p-2">
Art 51
</th>


<th className="border p-2">
Art 20
</th>


<th className="border p-2">
Legge 104
</th>


<th className="border p-2">
Festività
</th>


<th className="border p-2">
Elettorale
</th>


<th className="border p-2">
Pioggia
</th>


<th className="border p-2">
Lutto
</th>


<th className="border p-2">
Visita Medica
</th>


<th className="border p-2">
Aspettativa
</th>


<th className="border p-2">
Congedo
</th>


<th className="border p-2">
Sindacale
</th>


<th className="border p-2">
Servizio
</th>


<th className="border p-2">
Disagiati
</th>





<th className="border p-2">
0-10
</th>

<th className="border p-2">
11-20
</th>

<th className="border p-2">
21-30
</th>

<th className="border p-2">
31-40
</th>

<th className="border p-2">
41-50
</th>

<th className="border p-2">
51-60
</th>

<th className="border p-2">
61-90
</th>

<th className="border p-2">
91-120
</th>

<th className="border p-2">
Oltre 120
</th>



</tr>


</thead>







<tbody>


{

righe.map((riga,index)=>(


<tr key={index}>



<td className="border p-2">
{riga.matricolaSquadra}
</td>


<td className="border p-2">
{riga.cognome}
</td>


<td className="border p-2">
{riga.nome}
</td>






{

giorniMese.map(g=>(

<td
key={g}
className="border p-2 text-center"
>

{
riga.giorni[g] || ""
}

</td>

))

}







<td className="border p-2 font-bold">
{riga.totaleOre}
</td>



<td className="border p-2">
{riga.ferie}
</td>

<td className="border p-2">
{riga.ferieMaturate}
</td>


<td className="border p-2">
{riga.ferieUsate}
</td>


<td className="border p-2">
{riga.saldoFerie}
</td>


<td className="border p-2">
{riga.malattia}
</td>


<td className="border p-2">
{riga.carenza}
</td>


<td className="border p-2">
{riga.malattia50}
</td>


<td className="border p-2">
{riga.malattia66}
</td>






<td className="border p-2">
{riga.permessoRetribuito}
</td>


<td className="border p-2">
{riga.art51}
</td>


<td className="border p-2">
{riga.art20}
</td>


<td className="border p-2">
{riga.legge104}
</td>


<td className="border p-2">
{riga.festivitaSoppresse}
</td>


<td className="border p-2">
{riga.permessoElettorale}
</td>


<td className="border p-2">
{riga.permessoPioggia}
</td>


<td className="border p-2">
{riga.permessoLutto}
</td>


<td className="border p-2">
{riga.visitaMedica}
</td>


<td className="border p-2">
{riga.aspettativa}
</td>


<td className="border p-2">
{riga.congedoParentale}
</td>


<td className="border p-2">
{riga.permessoSindacale}
</td>


<td className="border p-2">
{riga.permessoServizio}
</td>


<td className="border p-2">
{riga.lavoriDisagiati}
</td>






<td className="border p-2">
{riga.km0_10}
</td>

<td className="border p-2">
{riga.km11_20}
</td>

<td className="border p-2">
{riga.km21_30}
</td>

<td className="border p-2">
{riga.km31_40}
</td>

<td className="border p-2">
{riga.km41_50}
</td>

<td className="border p-2">
{riga.km51_60}
</td>

<td className="border p-2">
{riga.km61_90}
</td>

<td className="border p-2">
{riga.km91_120}
</td>

<td className="border p-2">
{riga.kmOltre120}
</td>




</tr>


))

}



</tbody>



</table>


</div>



</div>


</div>


);


}