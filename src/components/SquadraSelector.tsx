
import { useEffect, useState } from 'react';

import { db } from "@/firebase/config";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

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

  const [squadreTXT, setSquadreTXT] = useState<Squadra[]>([]);
  const [squadreFirebase, setSquadreFirebase] = useState<Squadra[]>([]);

  const [matricolaInput, setMatricolaInput] = useState('');
  const [squadraTrovata, setSquadraTrovata] = useState<Squadra | null>(null);

  // CARICAMENTO INDIPENDENTE TXT E FIREBASE

  useEffect(() => {

    if (!distretto) return;

    let attivo = true;

    const caricaTXT = async () => {

      try {

        const numeroDistretto = distretto.match(/\d+/)?.[0];

        if (!numeroDistretto) {
          throw new Error("Distretto non valido");
        }

        const fileName = `/distretto${numeroDistretto}.txt`;

        const risposta = await fetch(fileName);

        if (!risposta.ok) {
          throw new Error("File TXT non disponibile");
        }

        const data = await risposta.text();

        const righe = data
          .split('\n')
          .filter(line => line.trim() !== '');

        const parsed: Squadra[] = righe.map(riga => {

          const [matricolaParte, squadraParte] = riga.split('squadra');

          if (!matricolaParte || !squadraParte) {
            throw new Error("Formato TXT non valido: " + riga);
          }

          const matricola = matricolaParte
            .trim()
            .replace('matricola', '')
            .trim();

          const parts = squadraParte
            .split('/')
            .filter(p => p.trim() !== '');

          return {
            matricola,
            nome: parts[1]?.trim() || '',
            operai: parts.slice(2).map(op => op.trim())
          };

        });

        if (attivo) {
          setSquadreTXT(parsed);
          console.log("Squadre TXT caricate:", parsed.length);
        }

      } catch (errore) {

        console.error("Errore caricamento TXT:", errore);

        if (attivo) {
          setSquadreTXT([]);
        }

      }

    };

    const caricaFirebase = async () => {

      try {

        const riferimento = collection(
          db,
          "squadre",
          distretto,
          "elenco"
        );

        const snapshot = await getDocs(riferimento);

        const elenco: Squadra[] = snapshot.docs.map(documento => {

          const dati = documento.data();

          return {
            matricola: String(dati.matricola || documento.id),
            nome: dati.caposquadra || '',
            operai: dati.operai || []
          };

        });

        if (attivo) {
          setSquadreFirebase(elenco);
          console.log("Squadre Firebase caricate:", elenco.length);
        }

      } catch (errore) {

        console.error("Errore caricamento Firebase:", errore);

        if (attivo) {
          setSquadreFirebase([]);
        }

      }

    };

    // I DUE CARICAMENTI SONO INDIPENDENTI

    caricaTXT();
    caricaFirebase();

    return () => {
      attivo = false;
    };

  }, [distretto]);


  // RICERCA MATRICOLA: PRIMA TXT, POI FIREBASE

  const handleMatricolaSubmit = async () => {

    const matricola = matricolaInput.trim();

    if (!matricola) {
      alert("Inserisci una matricola");
      return;
    }

    // 1. CERCA NEL TXT

    let squadra = squadreTXT.find(
      s => s.matricola === matricola
    );

    // 2. SE NON TROVATA, CERCA IN FIREBASE

    if (!squadra) {

      squadra = squadreFirebase.find(
        s => s.matricola === matricola
      );

    }

    // 3. SE ANCORA NON TROVATA, INTERROGA FIREBASE DIRETTAMENTE

    if (!squadra) {

      try {

        const squadraRef = doc(
          db,
          "squadre",
          distretto,
          "elenco",
          matricola
        );

        const squadraDoc = await getDoc(squadraRef);

        if (squadraDoc.exists()) {

          const dati = squadraDoc.data();

          squadra = {
            matricola: String(dati.matricola || squadraDoc.id),
            nome: dati.caposquadra || '',
            operai: dati.operai || []
          };

        }

      } catch (errore) {

        console.error("Errore ricerca Firebase:", errore);

      }

    }

    // 4. GESTIONE RISULTATO

    if (squadra) {

      setSquadraTrovata(squadra);

      setSelectedName(squadra.nome);

      setDatiSquadra({
        matricolaSquadra: squadra.matricola,
        caposquadra: squadra.nome
      });

    } else {

      alert('Matricola non trovata nel TXT né in Firebase.');

      setSquadraTrovata(null);

      setSelectedName('');

    }

  };


  // SELEZIONE PERSONA

  const handlePersonaSelect = (persona: string) => {

    setSelectedName(persona);

  };


  return (

    <div className="form-group">

      <h3>Inserisci Matricola Caposquadra</h3>

      <div className="flex gap-2">

        <input
          type="text"
          placeholder="Inserisci matricola"
          value={matricolaInput}
          onChange={(e) => setMatricolaInput(e.target.value)}
          className="placeholder-red-500 border border-gray-300 p-2"
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700"
          type="button"
          onClick={handleMatricolaSubmit}
        >
          Verifica
        </button>

      </div>


      {squadraTrovata && (

        <div className="radio-group mt-4">

          <p>Seleziona Persona:</p>

          {/* CAPOSQUADRA */}

          <label className="flex items-center gap-2">

            <input
              type="radio"
              checked={selectedName === squadraTrovata.nome}
              onChange={() => handlePersonaSelect(squadraTrovata.nome)}
            />

            👷‍♂️ {squadraTrovata.nome}

            <span className="text-sm text-gray-500">
              (Caposquadra)
            </span>

          </label>


          {/* OPERAI */}

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
