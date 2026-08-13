'use client';
import '../styles/global.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DistrettoSelector from '../components/DistrettoSelector';
import SquadraSelector from '../components/SquadraSelector';
import MenuPresenza from '../components/MenuPresenza';
import { Edit } from "lucide-react";
import { db } from "@/firebase/config";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  runTransaction
} from "firebase/firestore";
const MODALITA_TEST = true;
const CONTROLLO_PERMESSI_FIREBASE = true;
const CONTROLLO_FERIE_FIREBASE = false;
const MATURAZIONE_FERIE_FIREBASE = false;



const TabellaPresenze = ({ presenze }: { presenze: any[] }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border">

      <div className="bg-green-600 p-4">
        <h3 className="text-white text-xl font-bold">
          📋 Presenze del Giorno
        </h3>

        <p className="text-green-100 text-sm">
          Totale firme: {presenze.length}
        </p>
      </div>


      {presenze.length === 0 ? (

        <div className="p-5 text-center text-gray-500">
          Nessuna presenza registrata oggi
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-gray-100">

                <th className="px-4 py-3 text-left">
                  👤 Nome
                </th>

                <th className="px-4 py-3 text-left">
                  📌 Tipo
                </th>

                <th className="px-4 py-3 text-left">
                  📅 Data
                </th>

                <th className="px-4 py-3 text-left">
                  ⏰ Firma
                </th>

              </tr>
            </thead>


            <tbody>

              {presenze.map((presenza, index) => (

                <tr 
                  key={index}
                  className="border-t hover:bg-green-50"
                >

                  <td className="px-4 py-3 font-bold">
                    {presenza.nome}
                  </td>


                  <td className="px-4 py-3">

                    <span className="
                      bg-green-100
                      text-green-700
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-bold
                    ">
                      {presenza.tipo}
                    </span>

                  </td>


                  <td className="px-4 py-3">
                    {presenza.data}
                  </td>


                  <td className="px-4 py-3">

                    <span className="
                      bg-gray-800
                      text-white
                      px-3
                      py-1
                      rounded-lg
                      font-bold
                    ">
                      {presenza.oraFirma || '-'}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
};
//AGGIUNGO MODIFICA PER FIREBASE
const regolePermessi: Record<string, {
  tipo: string;
  limite: number;
}> = {
  "PERMESSO RETRIBUITO": {
    tipo: "ore",
    limite: 19
  },

  "ART 51": {
    tipo: "ore",
    limite: 16
  },

  "ART.20": {
    tipo: "ore",
    limite: 16
  },

  "LEGGE 104": {
    tipo: "giorni",
    limite: 3
  },

  "FESTIVITA SOPPRESSE": {
    tipo: "ore",
    limite: 32
  },

  "LAVORI DISAGIATI": {
    tipo: "ore",
    limite: 5
  }

};
type OfflineItem = {
  data: [string, string][]; // coppie [key, value]
  distretto: string;
  oraFirma: string; // ora originale salvata
};

const Home = () => {
  const [distretto, setDistretto] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [tipoPresenza, setTipoPresenza] = useState('');
  const [targa, setTarga] = useState('');
  const [chilometri, setChilometri] = useState('');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const [permesso, setPermesso] = useState('');
  const [orePermesso, setOrePermesso] = useState("");//AGGIUNTA
const [oraRientro, setOraRientro] = useState("");//AGGIUNTA
  const [posizione, setPosizione] = useState('');
  const [altitude, setAltitude] = useState('');
  const [presenze, setPresenze] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineItem[]>([]);
  const [Codice_Progetto, setCodice_Prodetto]=useState('');//AGGIUNTA
  const [datiSquadra, setDatiSquadra] = useState<any>(null);//AGGIUNTA
  const [oraRientro1, setOraRientro1] = useState("");//aggiunta
  const [rientro, setRientro] = useState("");//aggiunta
  const [fasciaKm, setFasciaKm] = useState('');//aggiunta
  const [giorniMalattia, setGiorniMalattia] = useState(0);//aggiunta

const [giorniCarenza, setGiorniCarenza] = useState(0);//aggiunta

const [giorniMalattia50, setGiorniMalattia50] = useState(0);//aggiunta

const [giorniMalattia66, setGiorniMalattia66] = useState(0);//aggiunta

  const getOraFormattata = () => {
    const now = new Date();
    const ore = now.getHours().toString().padStart(2, '0');
    const minuti = now.getMinutes().toString().padStart(2, '0');
    return `${ore}.${minuti}`;
  };

  const sheetUrls: Record<string, string> = {
    'Distretto 1': 'https://script.google.com/macros/s/AKfycbw9dg2OcVZgzNTmx9WgHTHHZT_WMGpp0FuYBoapuuM_K-BNl36JFJQxGtfzySIFidDo6Q/exec',
    'Distretto 2': 'https://script.google.com/macros/s/AKfycbzpGqtCZ5NgtdadtsYRghsyrVoG0dL0rRVmdUGiz4BmltlCOrJaleaf9uGLoWUbPJa4Xw/exec',
    'Distretto 3': 'https://script.google.com/macros/s/AKfycbwzjUPmIPHjJz1HXgt1ENfNZaaGwxz-kXBN8HhBTMl7vExXef55OHZAf_CXi7QMq1r7/exec',
    'Distretto 4': 'https://script.google.com/macros/s/AKfycbzvddCY0PJ_7NNZ2m5rajqPXxkzZhUbv8sL4_1HnyWxaXaxmRSYQ0cS9-BRniP6IrYLVQ/exec',
    'Distretto 5': 'https://script.google.com/macros/s/AKfycbzTVACwG9uRzYavPCQe0jhRyPfb7oKisuoEQ-SjxA83hV7eo-C361F8D0sVHnn73w8/exec',
    'Distretto 6': 'https://script.google.com/macros/s/AKfycbxiT6ienjNbhy3x9btO-18TMsaM8DXxx8umj_bxjxLsHRlZuDBC2Zn-LZ90c1INejw4/exec',
    'Distretto 7': 'https://script.google.com/macros/s/AKfycbx0JXfJzmwwPM_xFjrWLH1faGvMuyEvG6HIhsdSXNZ7--MfREdW2Jsnebl85luAOJ6g/exec',
    'Distretto 8': 'https://script.google.com/macros/s/AKfycbyzrpkMN_zd-tMH4LEYBiicK2JzIRkLtItV3M4-sVWLyL_aNXcKT9mtqVdRFonVEDnAhQ/exec',
    'Distretto 9': 'https://script.google.com/macros/s/AKfycby0LsBZg6m7qI6dbPI-z-Fnyt_hCA3gdbNWCINiTorcMqdR0u7sVMDJrXfny0ud6GRY/exec',
    'Distretto 10': 'https://script.google.com/macros/s/AKfycbwSTvD8VLsuXXimgVGo-WrITDVUFY9IJbZDMa0cfhF99t_stTlpHNTwT5Dg8ZudjxMs/exec',
    'Distretto 11': 'https://script.google.com/macros/s/AKfycbwcXG_QTjIm73aQZOmY2rqed7271HJdVxZEyheDfLLlNyM1tt0bXN3JnbyH1lvj8x8I/exec',
    'Distretto 12': 'https://script.google.com/macros/s/AKfycby3fuDsAYPQI5ulosjgDF2v360_FxGeKqzEkax8Yp-MwCrLoZ2qKTzdcaekE4Kb3hO0/exec',
    'Distretto 13': 'https://script.google.com/macros/s/AKfycbyAyZ8uzQK2Ii7ZHOrZ3QeHzfDlSclI9R2hr2FM5S9OvGd2qK4jhhlPcW-_cmGoLsRmuw/exec',
     'Distretto 14': 'https://script.google.com/macros/s/AKfycbx5DiiPDiwwScGHOEego4Avcd99jHXHfvpl1m0CnaBOVF4PfO0MSAsv6bu7XU1-y9gxSQ/exec',
     'Distretto 15':'https://script.google.com/macros/s/AKfycbzkR8Go1lx2wkCyITVLNODmU78HMudrxG0hfJSzh2aGDsvcRB3afl926EZvOgHA-hig8w/exec',
      
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('offlineQueue');
      if (saved) {
        const parsed: OfflineItem[] = JSON.parse(saved);
        setOfflineQueue(parsed);

        const presFromOffline = parsed.map(item => {
          const getVal = (k: string) => {
            const found = item.data.find(([key]) => key === k);
            return found ? found[1] : '';
          };
          return {
            nome: getVal('nome'),
            tipo: getVal('stato'),
            data: new Date().toLocaleDateString(),
            oraFirma: item.oraFirma, // usa ora salvata
          };
        });
        if (presFromOffline.length > 0) {
          setPresenze(prev => [...prev, ...presFromOffline]);
        }
      }
    } catch (e) {
      console.warn('offlineQueue parse error', e);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, altitude } = pos.coords;
          const coords = `${latitude},${longitude}`;
          setPosizione(coords);

          if (altitude !== null) {
            setAltitude(altitude.toFixed(2));
          } else {
            fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`)
              .then(res => res.json())
              .then(data => {
                const elevation = data.results?.[0]?.elevation;
                if (elevation !== undefined) {
                  setAltitude(elevation.toFixed(2));
                } else {
                  setAltitude('n.d.');
                }
              })
              .catch(() => setAltitude('n.d.'));
          }
        },
        (err) => console.warn('Errore posizione:', err),
        { enableHighAccuracy: true }
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const lastSavedDate = localStorage.getItem('lastPresenzeDate');
    if (lastSavedDate !== currentDate) {
      setPresenze([]);
      localStorage.setItem('lastPresenzeDate', currentDate);
      localStorage.removeItem('statiPresenze');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncOfflineQueue = async () => {
      if (!navigator.onLine) return;
      const saved = localStorage.getItem('offlineQueue');
      if (!saved) return;
      let queue: OfflineItem[] = [];
      try { queue = JSON.parse(saved); } catch { queue = []; }
      if (queue.length === 0) return;

      const remaining: OfflineItem[] = [];
      for (const item of queue) {
        if (!item.data) continue;
        const params = new URLSearchParams();
        item.data.forEach(([key, value]) => params.append(key, value));
        params.set('oraFirma', item.oraFirma); // forza ora salvata
        const success = await sendFormData(params, item.distretto, true);
        if (!success) remaining.push(item);
      }

      setOfflineQueue(remaining);
      localStorage.setItem('offlineQueue', JSON.stringify(remaining));

      if (remaining.length === 0) alert('✅ Dati offline inviati con successo.');
      else alert(`⚠️ Alcuni dati offline non sono stati inviati (${remaining.length}). Usa "Invia Dati Offline" per riprovare manualmente.`);
    };

    window.addEventListener('online', syncOfflineQueue);
    if (navigator.onLine) syncOfflineQueue();
    return () => window.removeEventListener('online', syncOfflineQueue);
  }, []);

 const sendFormData = async (
  formData: URLSearchParams,
  targetDistretto?: string,
  isAuto = false
): Promise<boolean | null> => {
  const url = targetDistretto ? sheetUrls[targetDistretto] : sheetUrls[distretto];

  // 🔸 Se non c’è connessione o URL, segna "offline"
  if (!navigator.onLine || !url) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    
    
    const text = await response.text();
    
    // 🔹 Caso messaggio di conferma ("⚠️ Ti restano ...")
     
     
    if (text.includes("⚠️ Ti restano")) {
      if (isAuto) return false;
     
      const conferma = confirm(text + "\n\nVuoi procedere?");
      if (!conferma) {
        console.warn("❌ Operazione annullata dall’utente. Nessun invio né salvataggio.");
        return null; // ⛔ non salvare offline
      }

      const ore = prompt("Quante ore vuoi prendere?");
      if (!ore) {
        console.warn("❌ Nessun valore ore inserito. Operazione annullata.");
        return null; // ⛔ non salvare offline
      }
    
      // Se confermato, invia la seconda richiesta
      formData.append("oreRichieste", ore);
      const response2 = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      alert(await response2.text());
      return true;
    }

    // 🔹 Caso errore logico dal backend ("❌ ...")
    if (text.includes("❌")) {
      alert(text);
      console.warn("⛔ Errore logico dal server. Nessun salvataggio offline.");
      return null;
    }

    // 🔹 Tutti gli altri casi → OK
    alert(text);
    return true;
  } catch (err) {
    console.error("Errore fetch:", err);
    return false; // salva in offlineQueue
  }
};


  const resetForm = () => {
    setTipoPresenza('');
    setTarga('');
    setChilometri('');
    setDataInizio('');
    setDataFine('');
    setPermesso('');
    setOrePermesso("");
setOraRientro("");//AGGIUNTA
setRientro("");//aggiuta
    setSelectedName('');//AGGIUNTA
    setCodice_Prodetto('');
  };
 const salvaSuFirebase = async () => {


  if (MODALITA_TEST) {

    console.log(
      "MODALITA TEST ATTIVA - Firebase non viene scritto"
    );

    return;

  }



  try {

    const oggi = new Date();

    const dataLavorativa =
      oggi.toISOString().split("T")[0];

    const giorno =
      oggi.getDate();

    const mese =
      oggi.getMonth() + 1;

    const anno =
      oggi.getFullYear();



    await addDoc(
      collection(db, "presenze"),
      {

        nome: selectedName,

        distretto: distretto,

        stato: tipoPresenza,


        targa: targa,

        chilometri: chilometri,


        dataInizio:
tipoPresenza === "Ferie" || tipoPresenza === "Malattia"
? dataInizio
: "",


dataFine:
tipoPresenza === "Ferie" || tipoPresenza === "Malattia"
? dataFine
: "",

        tipoPermesso: permesso,

        

        rientro: rientro,

        oraRientro: oraRientro,


        posizione: posizione,

        quota: altitude,


        codiceProgetto: Codice_Progetto,


        matricolaSquadra:
          datiSquadra?.matricolaSquadra || "",


        caposquadra:
          datiSquadra?.caposquadra || "",


        ruolo:
          selectedName === datiSquadra?.caposquadra
            ? "Caposquadra"
            : "Operaio",



        oraFirma:
          getOraFormattata(),



        // NUOVI CAMPI PER CARTELLINO

        dataLavorativa:
          dataLavorativa,


        giorno:
          giorno,


        mese:
          mese,


        anno:
          anno,


        // ore giornaliere (base futura)

        oreLavorate: 0,

            orePermesso:
  Number(orePermesso) || 0,

  fasciaKm:
  fasciaKm,

  giorniMalattia:
  Number(giorniMalattia) || 0,


giorniCarenza:
  Number(giorniCarenza) || 0,


giorniMalattia50:
  Number(giorniMalattia50) || 0,


giorniMalattia66:
  Number(giorniMalattia66) || 0,



        dataCreazione:
          serverTimestamp()

      }
    );


    console.log("✅ Dato salvato su Firebase");


  } catch (errore) {


    console.error(
      "❌ Errore Firebase:",
      errore
    );


  }

};

const salvaUscitaFirebase = async () => {

try {


const oggi = new Date();

const data =
oggi.toISOString().split("T")[0];


// cerca la presenza della giornata

const q = query(

collection(db,"presenze"),

where(
"nome",
"==",
selectedName
),

where(
"dataLavorativa",
"==",
data
),

where(
"stato",
"==",
"Presenza"
)

);



const snapshot = await getDocs(q);



if(snapshot.empty){

console.log(
"Nessuna presenza trovata da chiudere"
);

return;

}




const documento =
snapshot.docs[0];



const entrata =
documento.data().oraFirma;



const uscita =
getOraFormattata();



// calcolo ore

const [oraE,minE] =
entrata.split(".").map(Number);


const [oraU,minU] =
uscita.split(".").map(Number);


const minutiEntrata =
oraE * 60 + minE;


const minutiUscita =
oraU * 60 + minU;


const minutiTotali =
minutiUscita - minutiEntrata;



const ore =
Number(
(minutiTotali / 60).toFixed(2)
);



// aggiorna documento esistente

await updateDoc(

doc(
db,
"presenze",
documento.id
),

{


oraUscita:
uscita,


oreLavorate:
ore,


dataChiusura:
serverTimestamp()


}

);



console.log(
"Uscita registrata",
ore
);



}

catch(errore){

console.error(
"Errore uscita Firebase",
errore
);


}

};
 const controllaLimitePermessoFirebase = async () => {

    try {

      const q = query(
        collection(db, "configurazioni"),
        where("nome", "==", permesso)
      );


      const snapshot = await getDocs(q);


      if(snapshot.empty){

        console.log(
          "Nessuna configurazione trovata",
          permesso
        );

        return true;

      }


      const configurazione =
        snapshot.docs[0].data();

        


      console.log(
        "Configurazione:",
        configurazione
      );
      const oggi = new Date();

const anno =
  oggi.getFullYear();

const mese =
  oggi.getMonth() + 1;

console.log(
 "RICERCA:",
 selectedName,
 permesso,
 anno
);

const qUsati = query(

  collection(db,"presenze"),

  where(
    "nome",
    "==",
    selectedName
  ),

  where(
    "tipoPermesso",
    "==",
    permesso
  ),

  where(
    "anno",
    "==",
    anno
  )

);



const usatiSnapshot =
  await getDocs(qUsati);



let oreUsate = 0;



usatiSnapshot.forEach((doc)=>{

  const dati = doc.data();

  oreUsate +=
    Number(dati.orePermesso) || 0;

});



console.log(
  "Ore già usate:",
  oreUsate
);


console.log(
  "Limite:",
  configurazione.limiteOre
);

const oreRichieste =
  Number(orePermesso) || 0;


if(
  oreUsate + oreRichieste >
  Number(configurazione.limiteOre)
){

  console.log(
    "LIMITE SUPERATO"
  );

  return false;

}


      return true;


    } catch(errore){

      console.error(
        errore
      );

      return true;

    }

  };
  const controllaSaldoFerieFirebase = async () => {

  try {

    const q = query(
      collection(db, "ferie"),
      where(
        "nome",
        "==",
        selectedName
      )
    );


    const snapshot = await getDocs(q);


    if(snapshot.empty){

      console.log(
        "Nessun saldo ferie trovato per",
        selectedName
      );

      return true;

    }


   const documento =
  snapshot.docs[0];


let dati =
  documento.data();

  const oggi = new Date();

const meseAttuale =
  oggi.getMonth() + 1;

const annoAttuale =
  oggi.getFullYear();


const ultimaMaturazione =
  dati.ultimaMaturazione;


if(
  !ultimaMaturazione ||
  ultimaMaturazione.anno !== annoAttuale ||
  ultimaMaturazione.mese !== meseAttuale
){

  const saldoVecchio =
    Number(dati.saldoFerie) || 0;


  const nuovoSaldo =
  Number(
    (saldoVecchio + 1.8).toFixed(1)
  );


  const ferieMaturate =
    Number(dati.ferieMaturate) || 0;


  await updateDoc(
    documento.ref,
    {

      saldoFerie:
        nuovoSaldo,

      ferieMaturate:
        ferieMaturate + 1.8,

      ultimaMaturazione:{

        mese:
          meseAttuale,

        anno:
          annoAttuale

      }

    }
  );


  console.log(
    "✅ Maturazione ferie eseguita:",
    nuovoSaldo
  );


  // aggiorno il valore usato sotto
  dati.saldoFerie =
    nuovoSaldo;

}


const saldoDisponibile =
  Number(dati.saldoFerie) || 0;


console.log(
  "Saldo ferie Firebase:",
  saldoDisponibile
);


// calcolo giorni richiesti

const inizio =
  new Date(dataInizio);


const fine =
  new Date(dataFine);



const giorniRichiesti =
  Math.floor(
    (
      fine.getTime() -
      inizio.getTime()
    )
    /
    (1000 * 60 * 60 * 24)
  ) + 1;



console.log(
  "Giorni ferie richiesti:",
  giorniRichiesti
);



if(giorniRichiesti > saldoDisponibile){

  console.log(
    "Saldo ferie insufficiente"
  );

  return false;

}



return true;

  } catch(errore){

    console.error(
      "Errore controllo ferie Firebase",
      errore
    );

    return true;

  }

};
const scalaFerieFirebase = async () => {

  try {


    const q = query(
      collection(db, "ferie"),
      where(
        "nome",
        "==",
        selectedName
      )
    );


    const snapshot = await getDocs(q);


    if(snapshot.empty){

      console.log(
        "Nessun documento ferie trovato per",
        selectedName
      );

      return;

    }



    const documento =
      snapshot.docs[0];



    const dati =
      documento.data();



    const saldoAttuale =
      Number(dati.saldoFerie) || 0;



    const inizio =
      new Date(dataInizio);


    const fine =
      new Date(dataFine);



    const giorniPresi =
      Math.floor(
        (
          fine.getTime() -
          inizio.getTime()
        )
        /
        (1000 * 60 * 60 * 24)
      ) + 1;



    const nuovoSaldo =
  Number(
    (saldoAttuale - giorniPresi).toFixed(1)
  );
  const ferieUsateAttuali =
  Number(dati.ferieUsate) || 0;


const nuoveFerieUsate =
  ferieUsateAttuali + giorniPresi;


    console.log(
      "Saldo prima:",
      saldoAttuale
    );


    console.log(
      "Giorni scalati:",
      giorniPresi
    );


    console.log(
      "Nuovo saldo:",
      nuovoSaldo
    );



    await updateDoc(
  doc(
    db,
    "ferie",
    documento.id
  ),
  {

    saldoFerie:
      nuovoSaldo,

    ferieUsate:
      nuoveFerieUsate

  }
);

    console.log(
      "✅ Saldo ferie aggiornato Firebase"
    );


  }
  catch(errore){

    console.error(
      "Errore scalatura ferie Firebase",
      errore
    );

  }

};
const maturaFerieFirebase = async () => {

  try {

    const oggi = new Date();

    const mese = oggi.getMonth() + 1;
    const anno = oggi.getFullYear();


    const q = query(
      collection(db,"ferie"),
      where(
        "nome",
        "==",
        selectedName
      )
    );


    const snapshot = await getDocs(q);


    if(snapshot.empty){

      console.log(
        "Nessun saldo ferie trovato per",
        selectedName
      );

      return;

    }


    const documento =
      snapshot.docs[0];


    const dati =
      documento.data();


    const saldoAttuale =
      Number(dati.saldoFerie) || 0;


    const ultimoAggiornamento =
      dati.ultimaMaturazione;


    if(
      ultimoAggiornamento &&
      ultimoAggiornamento.mese === mese &&
      ultimoAggiornamento.anno === anno
    ){

      console.log(
        "Maturazione già effettuata",
        mese,
        anno
      );

      return;

    }


    const nuovoSaldo =
      saldoAttuale + 1.8;


    await updateDoc(
      documento.ref,
      {

        saldoFerie:
          nuovoSaldo,

        ultimaMaturazione:{

          mese: mese,

          anno: anno

        }

      }
    );


    console.log(
      "Ferie maturate:",
      1.8
    );


    console.log(
      "Nuovo saldo ferie:",
      nuovoSaldo
    );


  }
  catch(errore){

    console.error(
      "Errore maturazione ferie Firebase",
      errore
    );

  }

};
const controlloMaturazioneFerieMensile = async () => {

  try {

    if (!MATURAZIONE_FERIE_FIREBASE) {
      return;
    }


    const oggi = new Date();

    const giorno =
      oggi.getDate();

    const mese =
      oggi.getMonth() + 1;

    const anno =
      oggi.getFullYear();


    // La maturazione avviene solo il primo giorno del mese
    if (giorno !== 1) {

      console.log(
        "Oggi non è il primo del mese. Nessuna maturazione."
      );

      return;

    }


    const riferimentoSistema =
      doc(
        db,
        "gestioneSistema",
        "ferie"
      );


    // =====================================================
    // BLOCCO ATOMICO
    // =====================================================

    const risultato =
      await runTransaction(
        db,
        async (transaction) => {


          const documento =
            await transaction.get(
              riferimentoSistema
            );


          if (!documento.exists()) {

            console.error(
              "Documento gestioneSistema/ferie non trovato."
            );

            return false;

          }


          const dati =
            documento.data();


          const ultimoMese =
            Number(
              dati.ultimoMese
            ) || 0;


          const ultimoAnno =
            Number(
              dati.ultimoAnno
            ) || 0;


          // =================================================
          // CONTROLLO: MATURAZIONE GIÀ ESEGUITA
          // =================================================

          if (
            ultimoMese === mese &&
            ultimoAnno === anno
          ) {

            console.log(
              "Maturazione ferie già eseguita per",
              mese,
              anno
            );

            return false;

          }


          // =================================================
          // PRENDIAMO TUTTI GLI OPERAI
          // =================================================

          const snapshotFerie =
            await getDocs(
              collection(
                db,
                "ferie"
              )
            );


          // =================================================
          // AGGIORNIAMO IL BLOCCO CENTRALE
          // =================================================

          transaction.update(
            riferimentoSistema,
            {

              ultimoMese:
                mese,

              ultimoAnno:
                anno

            }
          );


          console.log(
            "Blocco maturazione acquisito:",
            mese,
            anno
          );


          // =================================================
          // AGGIORNAMENTO SALDI
          // =================================================

          for (
            const documentoFerie
            of snapshotFerie.docs
          ) {


            const datiFerie =
              documentoFerie.data();


            const saldo =
              Number(
                datiFerie.saldoFerie
              ) || 0;


            const nuovoSaldo =
              saldo + 1.8;


            transaction.update(
              documentoFerie.ref,
              {

                saldoFerie:
                  nuovoSaldo,

                ultimaMaturazione: {

                  mese:
                    mese,

                  anno:
                    anno

                }

              }
            );


            console.log(
              "Ferie maturate per:",
              datiFerie.nome,
              "Saldo:",
              nuovoSaldo
            );


          }


          return true;

        }
      );


    if (risultato) {

      console.log(
        "✅ Maturazione ferie mensile completata."
      );

    }
    else {

      console.log(
        "ℹ️ Nessuna maturazione ferie eseguita."
      );

    }


  }
  catch (errore) {

    console.error(
      "❌ Errore maturazione ferie mensile:",
      errore
    );

  }

};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const statiSalvati = JSON.parse(localStorage.getItem('statiPresenze') || '{}');

    let permessoFinale = permesso;
    if (tipoPresenza === 'Permessi Vari') {
      permessoFinale += ` - ${getOraFormattata()}`;
    }

    const oraFirmaFormattata = getOraFormattata();

    const formData = new URLSearchParams();
    formData.append('nome', selectedName.trim());
    formData.append('stato', tipoPresenza);
    formData.append('targa', `${targa} / ${chilometri} km / ${altitude} m / ${Codice_Progetto} C.P.`);
    formData.append('dataInizio', dataInizio);
    formData.append('dataFine', dataFine);
    formData.append('tipoPermesso', permessoFinale);
    formData.append('posizione', posizione);
    formData.append('oraFirma', oraFirmaFormattata);
    formData.append('Codice_Progetto',Codice_Progetto);

    if(
 CONTROLLO_PERMESSI_FIREBASE &&
 tipoPresenza==="Permessi Vari"
){

 const controllo =
 await controllaLimitePermessoFirebase();


 if(!controllo){

 alert(
 "❌ Permesso non disponibile. Limite superato."
 );

 setIsLoading(false);

 return;

 }

}
if(
 CONTROLLO_FERIE_FIREBASE &&
 tipoPresenza==="Ferie"
){

 const controlloFerie =
 await controllaSaldoFerieFirebase();


 if(!controlloFerie){

 alert(
 "❌ Saldo ferie insufficiente."
 );

 setIsLoading(false);

 return;

 }

}

    const risultato = await sendFormData(formData);

// ⛔ Caso annullato o errore logico → NON salvare nulla
if (risultato === null) {
  setIsLoading(false);
  resetForm();
  return;
}

// ✅ Caso riuscito online//aggiunta
if (risultato === true) {

console.log("ENTRO IN FIREBASE");


if(tipoPresenza === "Uscita"){

await salvaUscitaFirebase();

}
else{

await salvaSuFirebase();


if(tipoPresenza === "Ferie"){

  await scalaFerieFirebase();
  

}

}
  statiSalvati[selectedName] = tipoPresenza;
  localStorage.setItem("statiPresenze", JSON.stringify(statiSalvati));

 const nuovaPresenza = {
  nome: selectedName,
  tipo:
    tipoPresenza === "Permessi Vari"
      ? permesso + " - " + oraFirmaFormattata
      : tipoPresenza === "Ferie"
      ? `FERIE dal ${dataInizio} al ${dataFine}`
      : tipoPresenza === "Malattia"
      ? `MALATTIA dal ${dataInizio} al ${dataFine}`
      : tipoPresenza,
  data: new Date().toLocaleDateString(),
  oraFirma: oraFirmaFormattata,
};

 const updated = [...presenze, nuovaPresenza];
setPresenze(updated);
localStorage.setItem("presenzeStorico", JSON.stringify(updated));
  resetForm();
  setIsLoading(false);
  return;
}

// 💾 Caso offline → salva nella coda come prima
if (risultato === false) {
  const item: OfflineItem = {
    data: Array.from(formData.entries()),
    distretto: distretto,
    oraFirma: oraFirmaFormattata,
  };

  const newQueue = [...offlineQueue, item];
  setOfflineQueue(newQueue);
  localStorage.setItem("offlineQueue", JSON.stringify(newQueue));

  const nuovaPresenza = {
  nome: selectedName,
  tipo:
    tipoPresenza === "Permessi Vari"
      ? permesso + " - " + oraFirmaFormattata
      : tipoPresenza === "Ferie"
      ? `FERIE dal ${dataInizio} al ${dataFine}`
      : tipoPresenza === "Malattia"
      ? `MALATTIA dal ${dataInizio} al ${dataFine}`
      : tipoPresenza,
  data: new Date().toLocaleDateString(),
  oraFirma: oraFirmaFormattata,
};

  setPresenze((prev) => [...prev, nuovaPresenza]);

  alert("📴 Dati salvati offline. Verranno inviati appena torna la connessione.");
  resetForm();
  setIsLoading(false);
}
  };
  const handleSendOffline = async () => {
    if (offlineQueue.length === 0) return alert('Nessun dato offline da inviare.');
    const remaining: OfflineItem[] = [];
    for (const item of offlineQueue) {
      if (!item.data) continue;
      const params = new URLSearchParams();
      item.data.forEach(([key, value]) => params.append(key, value));
      params.set('oraFirma', item.oraFirma); // forza ora salvata
      const success = await sendFormData(params, item.distretto, false);
      if (!success) remaining.push(item);
    }
    setOfflineQueue(remaining);
    localStorage.setItem('offlineQueue', JSON.stringify(remaining));
    if (remaining.length === 0) alert('Tutti i dati offline inviati.');
    else alert(`Alcuni dati offline non sono stati inviati (${remaining.length}). Riprova.`);
  };
  const downloadPresenze = () => {
  if (presenze.length === 0) {
    alert("Nessun dato da scaricare.");
    return;
  }

  // Intestazioni CSV
  const headers = ["Nome", "Tipo Presenza", "Data", "Ora Firma"];
  const rows = presenze.map(p => [
    p.nome,
    p.tipo,
    p.data,
    p.oraFirma || "-"
  ]);

  // Costruisci CSV
  const csvContent =
    [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(",")) // wrap ogni cella tra ""
      .join("\n");

  // Crea blob e link per download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "presenze_giornaliere.csv";
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <div className="relative min-h-screen bg-green-50 flex flex-col items-center p-4 text-gray-800">
  

    <div className="relative flex items-center justify-center mb-6">
  {/* LOGO IN ALTO */}
  <img
    src="/logo-calabria-verde.png"
    alt="Calabria Verde"
    className="
      absolute
      left-1/2
      -translate-x-1/2
      top-0
      opacity-40
      w-28
      sm:w-36
      pointer-events-none
    "
  />

  {/* TITOLO */}
  <h1 className="relative z-10 text-2xl font-bold text-gray-800">
    Gestione Presenze
  </h1>
</div>


      <h2 className='text-2xl font-bold mb-4'> Azienda</h2>
      <h1 className='text-5xl font-bold mb-4'>Calabria Verde</h1>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">

  <Link href="/ddl">
    <div className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      👷‍♂️<br />
      Direttori dei Lavori
    </div>
  </Link>


  <Link href="/accesso/login">
    <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      📊<br />
      Dashboard
    </div>
  </Link>


  <Link href="/Notifica">
    <div className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      📄<br />
      Richiesta Giustificativi
    </div>
  </Link>


  <Link href="/Storico">
    <div className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      📅<br />
      Storico Mensilità
    </div>
  </Link>


  <Link href="/admin">
    <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      💬<br />
      Comunicazioni
    </div>
  </Link>


  <Link href="/Capo-Operaio">
    <div className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      👷<br />
      Capo Cantiere
    </div>
  </Link>


  <Link href="/Correzioni">
    <div className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer flex flex-col items-center">
      <Edit className="w-6 h-6 mb-1" />
      Correzioni
    </div>
  </Link>


  <Link href="/login-tutti-distretti">
    <div className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      🌍<br />
      Tutti i Distretti
    </div>
  </Link>


  <Link href="/accesso1">
    <div className="bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      📈<br />
      Dashboard Operativa
    </div>
  </Link>


  <Link href="/DashboardCentrale">
    <div className="bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-md p-4 text-center font-bold transition cursor-pointer">
      🏢<br />
      Dashboard Centrale
    </div>
  </Link>

</div>
     <div className="relative z-10 bg-white p-6 rounded-xl shadow-md w-full max-w-xl">



       <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
  <h2 className="text-lg font-bold text-green-700 mb-3">
    📍 Seleziona Distretto
  </h2>

  <DistrettoSelector setDistretto={setDistretto} />
</div>

        {distretto && (
          <>
            <SquadraSelector
              distretto={distretto}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
               setDatiSquadra={setDatiSquadra}
            />
            <MenuPresenza selected={tipoPresenza} onSelect={setTipoPresenza} />

            {selectedName && tipoPresenza && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                {tipoPresenza === 'Presenza' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Targa</label>
                      <input
                        type="text"
                        placeholder="AB123CD"
                        value={targa}
                        onChange={(e) => setTarga(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Chilometri</label>
                      <input
                        type="number"
                        placeholder="20450"
                        value={chilometri}
                        onChange={(e) => setChilometri(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                     
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Quota (m)</label>
                      <input
                        type="text"
                        placeholder="Quota"
                        value={altitude}
                        readOnly
                        className="w-full border rounded p-2 bg-gray-100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Codice Progetto</label>
                      <input
                        type="text"
                        placeholder="AB123CD"
                        value={Codice_Progetto}
                        onChange={(e) => setCodice_Prodetto(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                )}

                {(tipoPresenza === 'Ferie' || tipoPresenza === 'Malattia') && (
                  <>
                    <input
                      type="date"
                      value={dataInizio}
                      onChange={(e) => setDataInizio(e.target.value)}
                      required
                      className="border rounded p-2"
                    />
                    <input
                      type="date"
                      value={dataFine}
                      onChange={(e) => setDataFine(e.target.value)}
                      required
                      className="border rounded p-2"
                    />
                  </>
                )}

                {tipoPresenza === 'Permessi Vari' && (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Seleziona Tipo di Permesso</label>
                      <select
                        value={permesso}
                        onChange={(e) => setPermesso(e.target.value)}
                        required
                        className="border rounded p-2 w-full"
                      >
                        <option value="" disabled>-- Seleziona un permesso --</option>
                        <option value="PERMESSO RETRIBUITO">PERMESSO RETRIBUITO</option>
                        <option value="LEGGE 104">LEGGE 104</option>
                        <option value="ART.20">ART.20</option>
                        <option value="DISTACCAMENTO AIB">DISTACCAMENTO AIB</option>
                        <option value="DISTACCAMENTO CONVENZIONE">DISTACCAMENTO-CONVENZIONE</option>
                        <option value="PERMESSO LUTTO">PERMESSO LUTTO</option>
                        <option value="VISITA MEDICA">VISITA MEDICA</option>
                        <option value="PERMESSO ELETTORALE">PERMESSO ELETTORALE</option>
                        <option value="ART 51">ART 51</option>
                        <option value="PERMESSO CAUSA PIOGGIA">PERMESSO CAUSA PIOGGIA</option>
                        <option value="ATTIVABILE">ATTIVABILE</option>
                        <option value="ASPETTATIVA ">ASPETTATIVA</option>
                        <option value="LAVORI DISAGIATI ">LAVORI DISAGIATI</option>
                        <option value="CONGEDO PARENTALE">CONGEDO PARENTALE</option>
                        <option value="RIPOSO VEDETTE">RIPOSO VEDETTE</option>
                        <option value="PERMESSO SINDACALE">PERMESSO SINDACALE</option>
                         <option value="PERMESSO DI SERVIZIO AZIENDALE">PERMESSO DI SERVIZIO AZIENDALE</option>
                          <option value="FESTIVITA SOPPRESSE">FESTIVITA SOPPRESSE</option>
                      </select>
                      {permesso &&
 regolePermessi[permesso]?.tipo === "ore" && (

<div>

<label className="block text-sm font-medium mb-1">
Quante ore di permesso?
</label>

<input
 type="number"
 min="1"
 value={orePermesso}
 onChange={(e)=>
   setOrePermesso(e.target.value)
 }
 className="border rounded p-2 w-full"
/>

</div>//aggiunta permesso&&regolapermessi

)}
{permesso && (

<div className="mt-3">

<label className="block text-sm font-medium mb-1">
Rientro in servizio?
</label>


<select

value={rientro}

onChange={(e)=>
 setRientro(e.target.value)
}

className="border rounded p-2 w-full"

>

<option value="">
-- Seleziona --
</option>


<option value="SI">
SI - Rientra
</option>


<option value="NO">
NO - Non rientra
</option>


</select>

</div>//aggiunta rientro

)}
{rientro === "SI" && (

<div className="mt-3">

<label className="block text-sm font-medium mb-1">
Ora rientro
</label>


<input

type="time"

value={oraRientro}

onChange={(e)=>
 setOraRientro(e.target.value)
}

className="border rounded p-2 w-full"

/>


</div>//aggiunta ora rientro

)}
                    </div>

                    {permesso === 'DISTACCAMENTO AIB' && (
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Data Inizio</label>
                          <input
                            type="date"
                            value={dataInizio}
                            onChange={(e) => setDataInizio(e.target.value)}
                            required
                            className="border rounded p-2 w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Data Fine</label>
                          <input
                            type="date"
                            value={dataFine}
                            onChange={(e) => setDataFine(e.target.value)}
                            required
                            className="border rounded p-2 w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  {isLoading ? 'Invio...' : 'Invia Dati'}
                </button>
                
              </form>
            )}
          </>
        )}

        <TabellaPresenze presenze={presenze} />

        <button
    onClick={handleSendOffline}
    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded w-full"
  >
    INVIA DATI
  </button>
  <p className="text-sm text-gray-700 mt-1">
    INVIA DATI E' DA UTILIZZARE SOLTANTO SE VIENE VISUALIZZATO IL MESSAGGIO "ALCUNI DATI OFFLINE NON SONO STATI INVIATI".
  </p>

      </div>
 <Link href="/storico-squadra">

<button
className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
>

📊 STORICO SQUADRA

</button>

</Link>




    </div>
  );
};

export default Home;
