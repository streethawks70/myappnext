'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';

import {
  collection,
  getDocs
} from 'firebase/firestore';


interface Squadra {
  matricola: string;
  numeroSquadra: string;
  caposquadra: string;
  operai: string[];
  distretto: string;
}


interface Props {
  distretto: string;
}


const GestioneSquadreFirebase = ({ distretto }: Props) => {

  const [squadre, setSquadre] = useState<Squadra[]>([]);
  const [caricamento, setCaricamento] = useState(false);



  useEffect(() => {

    if (!distretto) return;


    const caricaSquadre = async () => {

      try {

        setCaricamento(true);


        const riferimento = collection(
          db,
          "squadre",
          distretto,
          "elenco"
        );


        const snapshot = await getDocs(riferimento);


        const elenco: Squadra[] = [];


        snapshot.forEach((doc) => {

          elenco.push(
            doc.data() as Squadra
          );

        });


        setSquadre(elenco);


      } catch (errore) {

        console.error(
          "Errore caricamento squadre:",
          errore
        );

      } finally {

        setCaricamento(false);

      }

    };


    caricaSquadre();


  }, [distretto]);




  if (!distretto) {
    return null;
  }



  return (

    <div className="bg-white rounded-xl shadow p-5 mt-5">

      <h2 className="text-xl font-bold text-green-700 mb-4">
        📋 Squadre {distretto}
      </h2>



      {caricamento && (
        <p>
          Caricamento squadre...
        </p>
      )}



      {!caricamento && squadre.length === 0 && (

        <p>
          Nessuna squadra trovata.
        </p>

      )}



      <div className="flex flex-col gap-4">


        {squadre.map((squadra) => (


          <div
            key={squadra.matricola}
            className="border rounded-lg p-4"
          >


            <h3 className="font-bold text-blue-700">

              👷 Squadra {squadra.numeroSquadra}

            </h3>


            <p className="font-semibold">

              Matricola:
              {' '}
              {squadra.matricola}

            </p>


            <p>

              Caposquadra:
              {' '}
              <b>
                {squadra.caposquadra}
              </b>

            </p>



            <div className="mt-3">

              <p className="font-semibold">
                Operai:
              </p>


              <ul className="list-disc ml-5">

                {squadra.operai.map((operaio,index)=>(

                  <li key={index}>
                    {operaio}
                  </li>

                ))}

              </ul>


            </div>


          </div>


        ))}


      </div>


    </div>

  );

};


export default GestioneSquadreFirebase;