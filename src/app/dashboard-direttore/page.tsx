'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import dynamic from "next/dynamic";


const MappaPresenze = dynamic(
  () => import("@/components/MappaPresenze"),
  {
    ssr:false
  }
);

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";


type Squadra = {

  matricola: string;

  numeroSquadra: string;

  caposquadra: string;

  operai: string[];

};



type Assegnazione = {

  nomeDirettore: string;

  distretto: string;

  squadre: string[];

};



type Presenza = {

  nome: string;

  matricolaSquadra: string;

  stato: string;

  oraFirma: string;

  ruolo: string;
   posizione:string;

};





export default function DashboardDirettore() {


  const [assegnazione, setAssegnazione] =
    useState<Assegnazione | null>(null);



  const [squadre, setSquadre] =
    useState<Squadra[]>([]);



  const [presenze, setPresenze] =
    useState<Presenza[]>([]);



  const [caricamento, setCaricamento] =
    useState(true);

    const [ricerca, setRicerca] = useState("");

    const [filtroStato,setFiltroStato] = useState("");







  useEffect(() => {

    


    const caricaDati = async () => {


      const direttoreId =
        localStorage.getItem("direttoreId");



      if (!direttoreId) {

        setCaricamento(false);
        return;

      }





      try {


        const riferimento =
          doc(
            db,
            "assegnazioniDirettori",
            direttoreId
          );



        const documento =
          await getDoc(riferimento);




        if (!documento.exists()) {

          setCaricamento(false);
          return;

        }




        const dati =
          documento.data() as Assegnazione;



        setAssegnazione(dati);







        const elenco: Squadra[] = [];




        for (const matricola of dati.squadre) {


          const squadraRef =
            doc(
              db,
              "squadre",
              dati.distretto,
              "elenco",
              matricola
            );



          const squadraDoc =
            await getDoc(squadraRef);




          if (squadraDoc.exists()) {


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
                squadra.operai || []

            });


          }


        }




        setSquadre(elenco);







        // CARICA PRESENZE DELLE SQUADRE DEL DIRETTORE


        const presenzeRef =
          collection(
            db,
            "presenze"
          );



        const queryPresenze =
          query(
            presenzeRef,
            where(
              "distretto",
              "==",
              dati.distretto
            )
          );



        const snapshot =
          await getDocs(queryPresenze);




        const elencoPresenze: Presenza[] =
          snapshot.docs.map(doc => {

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

                posizione:
                p.posizione,

            };  


          });




        setPresenze(elencoPresenze);




      } catch (errore) {


        console.error(
          "Errore caricamento dashboard:",
          errore
        );


      }




      setCaricamento(false);



    };



    caricaDati();



  }, []);









  if (caricamento) {

    return (
      <div className="p-6">
        Caricamento...
      </div>
    );

  }






  if (!assegnazione) {


    return (

      <div className="p-6">

        Nessuna assegnazione trovata

      </div>

    );

  }







  const trovaPresenza = (
    nome:string,
    matricola:string
  ) => {


    return presenze.find(
      p =>
        p.nome === nome &&
        p.matricolaSquadra === matricola
    );


  };

  const testoRicerca = ricerca.toLowerCase();


const squadreFiltrate = squadre.filter((squadra)=>{


const testoSquadra =
(
squadra.numeroSquadra +
" " +
squadra.matricola +
" " +
squadra.caposquadra +
" " +
squadra.operai.join(" ")
).toLowerCase();



return testoSquadra.includes(testoRicerca);


});


const conteggioStati = {

  Presenza: presenze.filter(
    p => p.stato === "Presenza"
  ).length,

  Ferie: presenze.filter(
    p => p.stato === "Ferie"
  ).length,

  Malattia: presenze.filter(
    p => p.stato === "Malattia"
  ).length,

  Permesso: presenze.filter(
    p => p.stato === "Permesso"
  ).length

};






  return (


    <div className="min-h-screen bg-gray-100 p-6">


      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

  <div
onClick={()=>setFiltroStato("Presenza")}
className="bg-green-100 rounded-lg p-4 text-center cursor-pointer"
>
    <div className="text-3xl font-bold">
      {conteggioStati.Presenza}
    </div>
    <div>👷 Presenti</div>
  </div>

  <div
onClick={() => setFiltroStato("Ferie")}
className="bg-blue-100 rounded-lg p-4 text-center cursor-pointer"
>
    <div className="text-3xl font-bold">
      {conteggioStati.Ferie}
    </div>
    <div>🏖 Ferie</div>
  </div>

  <div
onClick={() => setFiltroStato("Malattia")}
className="bg-yellow-100 rounded-lg p-4 text-center cursor-pointer"
>
    <div className="text-3xl font-bold">
      {conteggioStati.Malattia}
    </div>
    <div>🤒 Malattia</div>
  </div>

 <div
onClick={() => setFiltroStato("Permesso")}
className="bg-purple-100 rounded-lg p-4 text-center cursor-pointer"
>
    <div className="text-3xl font-bold">
      {conteggioStati.Permesso}
    </div>
    <div>📝 Permesso</div>
  </div>

</div>



        <h1 className="text-3xl font-bold mb-4">
          <input

type="text"

placeholder="🔎 Cerca operaio, squadra, matricola..."

value={ricerca}

onChange={(e)=>
setRicerca(e.target.value)
}

className="
border
rounded
p-3
w-full
mb-6
"

/>

          Dashboard Direttore

        </h1>



        <p>

          Direttore:

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


     <MappaPresenze
  presenze={
    filtroStato === ""
    ? presenze
    : presenze.filter(
        p => p.stato === filtroStato
      )
  }
/>


       {squadreFiltrate
.filter((squadra)=>{

if(filtroStato==="")
return true;


return presenze.some(
p =>
p.matricolaSquadra === squadra.matricola &&
p.stato === filtroStato
);


})
.map((squadra)=>(



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



                return (


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



      </div>


    </div>


  );


}