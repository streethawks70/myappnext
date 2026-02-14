'use client';

import { useState,useRef } from 'react';



const CUSTODIA_URL = 'https://script.google.com/macros/s/AKfycbxotYbMafictQ6DYBmfP4w04CKloGg6aFyxofgziF_Yje8-1MvoqqnrMB6GXWarUMm5/exec';

export default function ServizioCustodiaPage() {
  const [matricola, setMatricola] = useState('');
  const [squadra, setSquadra] = useState('');
  const [componenti, setComponenti] = useState<string[]>([]);
  const [selezionato, setSelezionato] = useState('');
  const [verificato, setVerificato] = useState(false);

  const [tipoPresenza, setTipoPresenza] = useState('');
  const [permesso, setPermesso] = useState('');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [targa, setTarga] = useState('');
  const [chilometri, setChilometri] = useState('');
 const [tracking, setTracking] = useState(false);
const watchIdRef = useRef<number | null>(null);
const lastPointRef = useRef<{lat:number; lon:number} | null>(null);
const kmTotaliRef = useRef(0);



  async function handleVerifica() {
    if (!matricola.trim()) {
      alert('Inserisci una matricola');
      return;
    }

    try {
      const res = await fetch('/custodia.txt');
      const lines = (await res.text())
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const match = lines.find(line => line.startsWith(matricola + '/'));
      if (!match) {
        alert('Matricola non trovata');
        return;
      }

      const parts = match.split('/');
      const squadraNome = parts[1];
      const capo = parts[2];
      const operai = parts.slice(3);
      const membri = [capo, ...operai];

      setSquadra(squadraNome);
      setComponenti(membri);
      setSelezionato(membri[0]);
      setVerificato(true);
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento dati');
    }
  }

  function getPosizioneUtente(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata'));
      } else {
        navigator.geolocation.getCurrentPosition(
          pos => resolve(pos.coords),
          err => reject(err)
        );
      }
    });
  }

  async function handleInvia() {
    if (!tipoPresenza) {
      alert('Seleziona uno stato di presenza');
      return;
    }
  
    if (!selezionato) {
      alert('Seleziona un nominativo');
      return;
    }
  
    if (tipoPresenza === 'Uscita' && (!targa.trim() || !chilometri.trim())) {
      alert('Inserisci targa e chilometri');
      return;
    }
  
    let coords;
    try {
      coords = await getPosizioneUtente();
    } catch (err: any) {
      alert('Impossibile recuperare la posizione: ' + err.message);
      return;
    }
  
    let tipoPermesso = '';
    if (tipoPresenza === 'Permessi Vari') {
      if (!permesso) {
        alert('Seleziona tipo permesso');
        return;
      }
      tipoPermesso = permesso;
    }
    // Se è PRESENZA → avvia tracking e non inviare ancora
// Se è PRESENZA → avvia tracking MA continua con invio
if (tipoPresenza === "Presenza") {
  if (!tracking) {
    startTracking();
  }
}


// Se è USCITA → ferma tracking prima di inviare

let kmCalcolati = 0;

if (tipoPresenza === "Uscita") {
  // aggiungi anche l'ultima posizione corrente
 
  kmCalcolati = stopTracking();
}

// posizione attuale dell'invio
const posizione = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;

// costruzione dati da inviare
const fd = new URLSearchParams({
  matricola,
  squadra,
  nome: selezionato,
  stato: tipoPresenza,
  tipoPermesso,
  dataInizio,
  dataFine,
  posizione,
  targa: tipoPresenza === 'Uscita' ? `${targa}/${chilometri} Km` : '',
  kmGps: tipoPresenza === 'Uscita' ? kmCalcolati.toFixed(2) : '',
});


      
      
  
    try {
      setIsLoading(true);
      const res = await fetch(CUSTODIA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString(),
      });
  
      const msg = await res.text();
      alert(`✅ ${msg}`);
    } catch (err) {
      console.error(err);
      alert('Errore invio dati');
    } finally {
      setIsLoading(false);
    }
  }
  function calcolaDistanza(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocalizzazione non supportata");
    return;
  }

  kmTotaliRef.current = 0;
  lastPointRef.current = null;
  setTracking(true);

  watchIdRef.current = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (lastPointRef.current) {
        const distanza = calcolaDistanza(
          lastPointRef.current.lat,
          lastPointRef.current.lon,
          latitude,
          longitude
        );

        // ignora micro movimenti (<20 metri)
        if (distanza > 0.02) {
          kmTotaliRef.current += distanza;
        }
      }

      lastPointRef.current = { lat: latitude, lon: longitude };

      console.log("KM accumulati:", kmTotaliRef.current);
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}


function stopTracking(): number {
  if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current);
  }

  setTracking(false);

  const totale = kmTotaliRef.current;

  kmTotaliRef.current = 0;
  lastPointRef.current = null;

  return totale;
}


  
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">🛡️ Servizio di Custodia, Guardania e Vigilanza</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Inserisci Matricola</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={matricola}
            onChange={e => setMatricola(e.target.value)}
            placeholder="es. 1111"
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={handleVerifica}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Verifica
          </button>
        </div>
      </div>

      {verificato && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <p><strong>Squadra:</strong> {squadra}</p>

          <div className="mt-4">
            <label className="block mb-2 font-semibold">Seleziona nominativo</label>
            <ul className="space-y-2">
              {componenti.map((nome, index) => (
                <li key={index}>
                  <button
                    onClick={() => setSelezionato(nome)}
                    className={`w-full text-left p-2 rounded border ${
                      selezionato === nome ? 'bg-blue-200 border-blue-500' : 'hover:bg-blue-50'
                    }`}
                  >
                   {index === 0 ? `👮‍♂️ Guardia: ${nome}` : `🚓 Agente: ${nome}`}

                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <label className="block mb-1 font-semibold">Stato</label>
            <select
              value={tipoPresenza}
              onChange={e => {
                setTipoPresenza(e.target.value);
                setPermesso('');
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Seleziona uno stato --</option>
              <option>Presenza</option>
              <option>Assenza</option>
              <option>Ferie</option>
              <option>Malattia</option>
              <option>Infortunio</option>
              <option>Permessi Vari</option>
              <option>Uscita</option>
            </select>
          </div>

          {tipoPresenza === 'Uscita' && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-semibold">Targa veicolo</label>
                <input
                  type="text"
                  value={targa}
                  onChange={e => setTarga(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="es. AB123CD"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Chilometri</label>
                <input
                  type="number"
                  value={chilometri}
                  onChange={e => setChilometri(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="es. 123456"
                />
              </div>
            </div>
          )}

          {tipoPresenza === 'Permessi Vari' && (
            <div className="mt-4">
              <label className="block mb-1 font-semibold">Tipo Permesso</label>
              <select
                value={permesso}
                onChange={e => setPermesso(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">-- Seleziona tipo permesso --</option>
                <option>PERMESSO RETRIBUITO</option>
                <option>LEGGE 104</option>
                <option>ART.9</option>
                <option>PERMESSO BANCA</option>
                <option>VISITA MEDICA</option>
                <option>PERMESSO LUTTO</option>
                <option>ART 51</option>
                <option>ATTIVABILE</option>
                <option>LAVORI DISAGIATI</option>
              </select>
            </div>
          )}

          {['Ferie', 'Malattia'].includes(tipoPresenza) && (
            <div className="mt-4 flex gap-2">
              <input
                type="date"
                value={dataInizio}
                onChange={e => setDataInizio(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={dataFine}
                onChange={e => setDataFine(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          )}

          <button
            onClick={handleInvia}
            disabled={isLoading}
            className="mt-6 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
          >
            {isLoading ? 'Invio...' : 'Invia Stato'}
          </button>
        </div>
      )}
    </div>
  );
}
