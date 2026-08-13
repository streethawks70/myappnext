import { useEffect, useState } from 'react';

import { db } from "@/firebase/config";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
// false = usa i file txt
// true = usa Firebase
const USA_FIREBASE_SQUADRE = false;


interface Squadra {
  matricola: string;
  nome: string;
  operai: string[];
}

const SquadraSelector = ({
  distretto,
  setSelectedName,
  selectedName,
   setDatiSquadra
}: {
  distretto: string;
  setSelectedName: (name: string) => void;
  selectedName: string;
  setDatiSquadra: (dati: any) => void;
}) => {
  const [squadre, setSquadre] = useState<Squadra[]>([]);
  const [matricolaInput, setMatricolaInput] = useState('');
  const [squadraTrovata, setSquadraTrovata] = useState<Squadra | null>(null);
  const [valore, setValore] = useState("");

  useEffect(() => {


  if (!distretto) return;



  const caricaSquadre = async () => {


    try {


      if (USA_FIREBASE_SQUADRE) {


        const riferimento =
          collection(
            db,
            "squadre",
            distretto,
            "elenco"
          );


        const snapshot =
          await getDocs(riferimento);



        const elenco = snapshot.docs.map(doc => {


          const dati = doc.data();


          return {

            matricola:
              dati.matricola,

            nome:
              dati.caposquadra,

            operai:
              dati.operai || []

          };


        });



        setSquadre(elenco);


      } else {


        const fileName =
          `/distretto${distretto.match(/\d+/)?.[0]}.txt`;


        const risposta =
          await fetch(fileName);



        const data =
          await risposta.text();



        const righe =
          data
          .split('\n')
          .filter(
            line => line.trim() !== ''
          );



        const parsed =
          righe.map(riga => {


            const [matricolaParte, squadraParte] =
              riga.split('squadra');


            const matricola =
              matricolaParte
              .trim()
              .replace('matricola','')
              .trim();



            const parts =
              squadraParte
              .split('/')
              .filter(
                p => p.trim() !== ''
              );



            return {

              matricola,

              nome:
                parts[1].trim(),

              operai:
                parts
                .slice(2)
                .map(
                  op=>op.trim()
                )

            };


          });



        setSquadre(parsed);


      }


    }
    catch(errore){

      console.error(
        "Errore caricamento squadre:",
        errore
      );


      setSquadre([]);


    }


  };



  caricaSquadre();


},[distretto]);
  const handleMatricolaSubmit = async () => {

    if (USA_FIREBASE_SQUADRE) {

  try {

    const squadraRef = doc(
      db,
      "squadre",
      distretto,
      "elenco",
      matricolaInput.trim()
    );

    const squadraDoc = await getDoc(squadraRef);

    if (!squadraDoc.exists()) {

      alert("Matricola non trovata");

      return;

    }

    const dati = squadraDoc.data();

    const squadra = {

      matricola: dati.matricola,

      nome: dati.caposquadra,

      operai: dati.operai || []

    };

    setSquadraTrovata(squadra);

    setSelectedName(squadra.nome);

    setDatiSquadra({

      matricolaSquadra: squadra.matricola,

      caposquadra: squadra.nome

    });

    return;

  }

  catch (errore) {

    console.error(errore);

    alert("Errore Firebase");

    return;

  }

}

    const squadra = squadre.find(s => s.matricola === matricolaInput.trim());
   if (squadra) {

  setSquadraTrovata(squadra);

  setSelectedName(squadra.nome);


  setDatiSquadra({
    matricolaSquadra: squadra.matricola,
    caposquadra: squadra.nome
  });

} else {
      alert('Matricola non trovata nel distretto selezionato.');
      setSquadraTrovata(null);
      setSelectedName('');
    }
  };

  const handlePersonaSelect = (persona: string) => {
    setSelectedName(persona);
  };

  return (
    <div className="form-group">
      <h3>Inserisci Matricola Caposquadra</h3>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder ="Inserisci matricola"
          value={matricolaInput}
          onChange={(e) => setMatricolaInput(e.target.value)}
           className="placeholder-red-500 border border-gray-300 p-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700"type="button" onClick={handleMatricolaSubmit}>
          Verifica
        </button>
      </div>

      {squadraTrovata && (
  <div className="radio-group mt-4">
    <p>Seleziona Persona:</p>

    {/* Caposquadra (primo della lista) */}
    <label className="flex items-center gap-2">
      <input
        type="radio"
        checked={selectedName === squadraTrovata.nome}
        onChange={() => handlePersonaSelect(squadraTrovata.nome)}
      />
      👷‍♂️ {squadraTrovata.nome} <span className="text-sm text-gray-500">(Caposquadra)</span>
    </label>

    {/* Operai */}
    {squadraTrovata.operai.map((operaio, i) => (
      <label key={i} className="flex items-center gap-2">
        <input
          type="radio"
          checked={selectedName === operaio}
          onChange={() => handlePersonaSelect(operaio)}
        />
        👷 {operaio}
        
      </label>
      
    ))}
  </div>
)}


    </div>
  );
};

export default SquadraSelector;

