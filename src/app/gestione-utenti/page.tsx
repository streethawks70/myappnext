'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc
} from "firebase/firestore";


type Squadra = {
  matricola: string;
  caposquadra: string;
  numeroSquadra: string;
};


const distretti = Array.from(
  { length: 15 },
  (_, i) => `Distretto ${i + 1}`
);



export default function GestioneUtenti() {


  const [distretto, setDistretto] = useState("Distretto 5");

  const [squadre, setSquadre] = useState<Squadra[]>([]);

  const [caricamento, setCaricamento] = useState(false);


  const [codiceDirettore, setCodiceDirettore] = useState("");

  const [nomeDirettore, setNomeDirettore] = useState("");

  const [squadreSelezionate, setSquadreSelezionate] = useState<string[]>([]);



  const caricaSquadre = async () => {

    setCaricamento(true);


    try {

      const riferimento = collection(
        db,
        "squadre",
        distretto,
        "elenco"
      );


      const snapshot = await getDocs(riferimento);


      const elenco: Squadra[] = snapshot.docs.map(doc => {

        const dati = doc.data();


        return {

          matricola: dati.matricola,

          caposquadra: dati.caposquadra,

          numeroSquadra: dati.numeroSquadra

        };

      });



      setSquadre(elenco);



    } catch (errore) {

      console.error(
        "Errore caricamento squadre:",
        errore
      );

      setSquadre([]);

    }


    setCaricamento(false);

  };





  useEffect(() => {

    caricaSquadre();

  }, [distretto]);







  const selezionaSquadra = (matricola: string) => {


    setSquadreSelezionate((precedenti) => {


      if (precedenti.includes(matricola)) {


        return precedenti.filter(
          (m) => m !== matricola
        );


      } else {


        return [
          ...precedenti,
          matricola
        ];


      }


    });


  };







  const salvaAssegnazione = async () => {


    if (!codiceDirettore || !nomeDirettore) {

      alert("Inserire codice e nome direttore");

      return;

    }


    if (squadreSelezionate.length === 0) {

      alert("Selezionare almeno una squadra");

      return;

    }



    try {


      await setDoc(

        doc(
          db,
          "utenti",
          codiceDirettore
        ),

       {
  nome: nomeDirettore,
  ruolo: "Direttore",
  distretto: distretto,
  password: "123456",
  attivo: true
}

      );





      await setDoc(

        doc(
          db,
          "assegnazioniDirettori",
          codiceDirettore
        ),

        {

          direttoreId: codiceDirettore,

          nomeDirettore: nomeDirettore,

          distretto: distretto,

          squadre: squadreSelezionate

        }

      );



      alert(
        "✅ Assegnazione salvata correttamente"
      );



      setCodiceDirettore("");

      setNomeDirettore("");

      setSquadreSelezionate([]);




    } catch (errore) {


      console.error(
        "Errore salvataggio:",
        errore
      );


      alert(
        "Errore durante il salvataggio"
      );


    }


  };









  return (


    <div className="min-h-screen bg-gray-100 p-6">


      <h1 className="text-3xl font-bold mb-6">
        Gestione Utenti - Super User
      </h1>





      <div className="bg-white rounded-xl shadow p-6">





        <div className="mb-6">

          <label className="block font-bold mb-2">
            Codice Direttore
          </label>


          <input

            type="text"

            value={codiceDirettore}

            onChange={(e) =>
              setCodiceDirettore(e.target.value)
            }

            placeholder="DIR001"

            className="border rounded p-2 w-full"

          />

        </div>





        <div className="mb-6">


          <label className="block font-bold mb-2">
            Nome Direttore
          </label>


          <input

            type="text"

            value={nomeDirettore}

            onChange={(e) =>
              setNomeDirettore(e.target.value)
            }

            placeholder="Nome reale direttore"

            className="border rounded p-2 w-full"

          />


        </div>







        <label className="block font-bold mb-2">
          Seleziona Distretto
        </label>



        <select

          value={distretto}

          onChange={(e) => {

            setDistretto(e.target.value);

            setSquadreSelezionate([]);

          }}

          className="border rounded p-2 mb-6"

        >


          {distretti.map((d) => (

            <option
              key={d}
              value={d}
            >

              {d}

            </option>

          ))}


        </select>







        <h2 className="text-xl font-bold mb-4">

          Squadre {distretto}

        </h2>






        {caricamento && (

          <p>
            Caricamento...
          </p>

        )}






        {squadre.map((squadra) => (


          <div

            key={squadra.matricola}

            className="border-b py-3 flex gap-3 items-start"

          >


            <input

              type="checkbox"

              checked={
                squadreSelezionate.includes(
                  squadra.matricola
                )
              }

              onChange={() =>
                selezionaSquadra(
                  squadra.matricola
                )
              }

              className="mt-1"

            />



            <div>


              👷 Squadra {squadra.numeroSquadra}


              <br />


              Matricola:

              <b>
                {squadra.matricola}
              </b>



              <br />


              Caposquadra:

              <b>
                {squadra.caposquadra}
              </b>



            </div>



          </div>


        ))}






        <div className="mt-8 bg-gray-100 rounded p-4">


          <h3 className="font-bold mb-2">

            Riepilogo assegnazione

          </h3>



          <p>
            Codice Direttore:
            <b> {codiceDirettore}</b>
          </p>



          <p>
            Nome Direttore:
            <b> {nomeDirettore}</b>
          </p>



          <p>
            Distretto:
            <b> {distretto}</b>
          </p>



          <p>
            Squadre selezionate:
            <b>
              {" "}
              {squadreSelezionate.join(", ")}
            </b>
          </p>



        </div>





        <button

          onClick={salvaAssegnazione}

          className="
          mt-6
          bg-green-600
          hover:bg-green-700
          text-white
          font-bold
          py-3
          px-6
          rounded-xl
          w-full
          "

        >

          SALVA ASSEGNAZIONE DIRETTORE

        </button>




      </div>


    </div>


  );


}