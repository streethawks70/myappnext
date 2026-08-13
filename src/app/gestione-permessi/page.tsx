'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";

type Permesso = {

  id: string;

  nome: string;

  codice: string;

  tipoLimite: string;

  limiteOre: number;

  attivo: boolean;

};



export default function GestionePermessi() {


  const [permessi, setPermessi] =
    useState<Permesso[]>([]);


  const [caricamento, setCaricamento] =
    useState(true);

    const [modifica, setModifica] =
  useState<Permesso | null>(null);


const [nuovoLimite, setNuovoLimite] =
  useState(0);


const [nuovoTipo, setNuovoTipo] =
  useState("");

  const [nuovoAttivo, setNuovoAttivo] =
  useState(true);

  const [nuovoNome, setNuovoNome] =
  useState("");


const [nuovoCodice, setNuovoCodice] =
  useState("");


const [nuovoTipoNuovo, setNuovoTipoNuovo] =
  useState("ore");


const [nuovoLimiteNuovo, setNuovoLimiteNuovo] =
  useState(0);


const [nuovoAttivoNuovo, setNuovoAttivoNuovo] =
  useState(true);





  const caricaPermessi = async () => {


    try {


      const riferimento =
        collection(
          db,
          "configurazioni",
          
        );


      const snapshot =
        await getDocs(riferimento);



      const elenco =
        snapshot.docs.map((doc)=>{


          const dati =
            doc.data();

            


          return {


            id: doc.id,


            nome:
              dati.nome || "",


            codice:
              dati.codice || "",


            tipoLimite:
              dati.tipoLimite || "",


            limiteOre:
              dati.limiteOre || 0,


            attivo:
              dati.attivo ?? false


          };


        });



      setPermessi(elenco);



    }

    catch(errore){


      console.error(
        "Errore caricamento permessi:",
        errore
      );


    }


    setCaricamento(false);


  };





  useEffect(()=>{


    caricaPermessi();


  },[]);


const salvaModifica = async () => {


  if(!modifica) return;


  try {


    await updateDoc(

      doc(
        db,
        "configurazioni",
        modifica.id
      ),

     {

  limiteOre:
    Number(nuovoLimite),

  tipoLimite:
    nuovoTipo,

  attivo:
    nuovoAttivo

}

    );


    alert("✅ Configurazione aggiornata");


    setModifica(null);


    caricaPermessi();


  }

  catch(errore){

    console.error(
      "Errore aggiornamento:",
      errore
    );

  }


};

const creaPermesso = async () => {


  try {


    await addDoc(

      collection(
        db,
        "configurazioni"
      ),

      {

        nome:
          nuovoNome,


        codice:
          nuovoCodice,


        tipoLimite:
          nuovoTipoNuovo,


        limiteOre:
          Number(nuovoLimiteNuovo),


        attivo:
          nuovoAttivoNuovo

      }

    );



    alert(
      "✅ Nuovo permesso creato"
    );


    // pulizia campi

    setNuovoNome("");

    setNuovoCodice("");

    setNuovoTipoNuovo("ore");

    setNuovoLimiteNuovo(0);

    setNuovoAttivoNuovo(true);



    // ricarica tabella

    caricaPermessi();



  }


  catch(errore){


    console.error(
      "Errore creazione permesso:",
      errore
    );


    alert(
      "❌ Errore creazione permesso"
    );


  }


};




  return (


    <div className="min-h-screen bg-gray-100 p-6">


      <div className="bg-white rounded-xl shadow p-6">


        <h1 className="text-3xl font-bold mb-6">

          ⚙️ Gestione Permessi

        </h1>




        {
          caricamento &&

          <p>
            Caricamento...
          </p>

        }





        <div className="overflow-auto">


          <table className="border-collapse border w-full">


            <thead>

              <tr>


                <th className="border p-2">
                  Permesso
                </th>


                <th className="border p-2">
                  Codice
                </th>


                <th className="border p-2">
                  Limite ore
                </th>


                <th className="border p-2">
                  Tipo limite
                </th>


                <th className="border p-2">
                  Attivo
                </th>

                <th className="border p-2">
  Azioni
</th>


              </tr>


            </thead>




            <tbody>


            {
              permessi.map((p)=>(


                <tr key={p.id}>


                  <td className="border p-2">
                    {p.nome}
                  </td>


                  <td className="border p-2">
                    {p.codice}
                  </td>


                  <td className="border p-2">
                    {p.limiteOre}
                  </td>


                  <td className="border p-2">
                    {p.tipoLimite}
                  </td>


                  <td className="border p-2">

                    {
                      p.attivo
                      ? "✅"
                      : "❌"
                    }

                  </td>
                  <td className="border p-2">

<button

className="bg-blue-600 text-white px-3 py-1 rounded"

onClick={()=>{

setModifica(p);

setNuovoLimite(
  p.limiteOre
);

setNuovoTipo(
  p.tipoLimite
);

setNuovoAttivo(
  p.attivo
);

}}

>

✏️ Modifica

</button>

</td>


                </tr>


              ))
            }


            </tbody>


          </table>


              </div>


        {
          modifica && (

            <div className="mt-6 border rounded-xl p-4 bg-gray-50">


              <h2 className="text-xl font-bold mb-4">

                Modifica:
                {modifica.nome}

              </h2>



              <label className="block mb-1">
                Tipo limite
              </label>


              <select

                className="border p-2 w-full mb-3"

                value={nuovoTipo}

                onChange={(e)=>
                  setNuovoTipo(e.target.value)
                }

              >

                <option value="ore">
                  Ore
                </option>


                <option value="giorni">
                  Giorni
                </option>


              </select>




              <label className="block mb-1">
                Limite
              </label>


              <input

                type="number"

                className="border p-2 w-full mb-3"

                value={nuovoLimite}

                onChange={(e)=>
                  setNuovoLimite(
                    Number(e.target.value)
                  )
                }

              />

              <label className="block mb-1">
  Stato permesso
</label>


<select

className="border p-2 w-full mb-3"

value={
  nuovoAttivo
  ? "true"
  : "false"
}

onChange={(e)=>
  setNuovoAttivo(
    e.target.value === "true"
  )
}

>

<option value="true">
  ✅ Attivo
</option>


<option value="false">
  ❌ Disattivato
</option>


</select>




              <button

                className="bg-green-600 text-white px-4 py-2 rounded"

                onClick={salvaModifica}

              >

                💾 Salva

              </button>




              <button

                className="ml-3 bg-gray-500 text-white px-4 py-2 rounded"

                onClick={()=>
                  setModifica(null)
                }

              >

                Annulla

              </button>



            </div>

          )
        }



      </div>


    </div>


  );


}