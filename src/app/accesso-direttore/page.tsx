'use client';

import { useState } from "react";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";


export default function AccessoDirettore() {


  const router = useRouter();


  const [codiceDirettore, setCodiceDirettore] = useState("");

  const [password, setPassword] = useState("");

  const [errore, setErrore] = useState("");

  const [caricamento, setCaricamento] = useState(false);




  const login = async () => {


    setErrore("");



    if (!codiceDirettore || !password) {

      setErrore(
        "Inserire codice e password"
      );

      return;

    }



    try {


      setCaricamento(true);



      const riferimento = doc(
        db,
        "utenti",
        codiceDirettore.trim()
      );



      const documento = await getDoc(
        riferimento
      );



      if (!documento.exists()) {


        setErrore(
          "Direttore non trovato"
        );

        setCaricamento(false);

        return;


      }




      const dati = documento.data();





      if (dati.ruolo !== "Direttore") {


        setErrore(
          "Utente non autorizzato"
        );

        setCaricamento(false);

        return;


      }





      if (dati.attivo !== true) {


        setErrore(
          "Utente disattivato"
        );

        setCaricamento(false);

        return;


      }





      if (dati.password !== password) {


        setErrore(
          "Password errata"
        );

        setCaricamento(false);

        return;


      }







      localStorage.setItem(
        "direttoreId",
        codiceDirettore.trim()
      );



      localStorage.setItem(
        "nomeDirettore",
        dati.nome
      );



      localStorage.setItem(
        "distrettoDirettore",
        dati.distretto
      );






      router.push(
        "/dashboard-direttore"
      );




    } catch (errore) {


      console.error(
        "Errore login direttore:",
        errore
      );


      setErrore(
        "Errore durante accesso"
      );


    }


    setCaricamento(false);


  };








  return (


    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">



      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">



        <h1 className="text-3xl font-bold text-center mb-6">

          Accesso Direttore

        </h1>





        <div className="mb-4">


          <label className="block font-bold mb-2">

            Codice Direttore

          </label>


          <input

            type="text"

            value={codiceDirettore}

            onChange={(e)=>
              setCodiceDirettore(
                e.target.value
              )
            }

            placeholder="DIR001"

            className="border rounded p-3 w-full"

          />


        </div>







        <div className="mb-6">


          <label className="block font-bold mb-2">

            Password

          </label>


          <input

            type="password"

            value={password}

            onChange={(e)=>
              setPassword(
                e.target.value
              )
            }

            placeholder="Password"

            className="border rounded p-3 w-full"

          />


        </div>







        {errore && (

          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">

            {errore}

          </div>

        )}








        <button

          onClick={login}

          disabled={caricamento}

          className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          font-bold
          py-3
          rounded-xl
          w-full
          "

        >

          {caricamento
            ? "Accesso..."
            : "ACCEDI"
          }


        </button>






      </div>



    </div>


  );


}