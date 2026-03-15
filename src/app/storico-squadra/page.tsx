'use client';

import { useEffect, useState } from "react";

export default function StoricoSquadra(){

const [presenze,setPresenze] = useState<any[]>([]);

useEffect(()=>{

const saved = localStorage.getItem("presenzeStorico");

if(saved){
setPresenze(JSON.parse(saved));
}

},[]);

return(

<div className="p-6">

<h1 className="text-2xl font-bold mb-4">
Storico Presenze Squadra
</h1>

<table className="table-auto border-collapse w-full text-left">

<thead>

<tr>
<th className="border px-4 py-2">Nome</th>
<th className="border px-4 py-2">Tipo</th>
<th className="border px-4 py-2">Data</th>
<th className="border px-4 py-2">Ora</th>
</tr>

</thead>

<tbody>

{presenze.map((p,i)=>(

<tr key={i}>
<td className="border px-4 py-2">{p.nome}</td>
<td className="border px-4 py-2">{p.tipo}</td>
<td className="border px-4 py-2">{p.data}</td>
<td className="border px-4 py-2">{p.oraFirma}</td>
</tr>

))}

</tbody>

</table>

</div>

)

}