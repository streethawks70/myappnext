'use client';

import { useState } from 'react';

const CUSTODIA_URL =
  'https://script.google.com/macros/s/AKfycbyYhMrYRgpmt-C1DP3g0xJs_TN59OOpzCQgHvrYmcBqy5-0jJ8Aa-aSGk9r00YIpbZf/exec';

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
  const[chilometri,setChilometri]=useState('');

  // --- Funzione verifica matricola ---
  async function handleVerifica() {
    if (!matricola.trim()) return alert('Inserisci una matricola');

    try {
      const res = await fetch('/custodia.txt');
      const lines = (await res.text())
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const match = lines.find(line => line.startsWith(matricola + '/'));
      if (!match) return alert('Matricola non trovata');

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
      alert('Errore caricamento dati');
    }
  }

  // --- Recupero posizione utente ---
  function getPosizioneUtente(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocalizzazione non supportata'));
      navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords), err => reject(err));
    });
  }

  // --- Funzione invio firma ---
  async function handleInvia() {
    if (!tipoPresenza) return alert('Seleziona stato presenza');
    if (!selezionato) return alert('Seleziona nominativo');

    let coords;
    try {
      coords = await getPosizioneUtente();
    } catch (err: any) {
      return alert('Impossibile recuperare la posizione: ' + err.message);
    }

    let tipoPermesso = '';
    if (tipoPresenza === 'Permessi Vari') {
      if (!permesso) return alert('Seleziona tipo permesso');
      tipoPermesso = permesso;
    }

    if (tipoPresenza === 'Uscita' && !targa.trim()&& chilometri) return alert('Inserisci targa veicolo');

    setIsLoading(true);

    try {
      // --- Determina stringa DA per Tasker ---
      let daValue = '';
      if (tipoPresenza === 'Presenza') daValue = 'INIZIO';
      if (tipoPresenza === 'Uscita') daValue = 'FINE';

      await inviaGoogleSheet({
        matricola,
        squadra,
        nome: selezionato,
        stato: tipoPresenza,
        tipoPermesso,
        dataInizio,
        dataFine,
        posizione: `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`,
       targa: tipoPresenza === 'Uscita'
  ? `${targa} - ${chilometri} km`
  : '',

       // chilometri :tipoPresenza ==='Uscita'?chilometri:'',
        kmGps: '',    // Tasker aggiornerà via POST in CZ
        da: daValue,  // ← colonna DA per INIZIO/FINE
      });

      alert(`✅ Stato "${tipoPresenza}" inviato con successo!`);
    } catch (err) {
      console.error(err);
      alert('Errore invio dati');
    } finally {
      setIsLoading(false);
    }
  }

  // --- Invio dati al Google Sheet ---
  async function inviaGoogleSheet(dati: Record<string, string>) {
    const fd = new URLSearchParams(dati);
    const res = await fetch(CUSTODIA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fd.toString(),
    });
    return await res.text();
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🛡️ Servizio di Custodia, Guardania e Vigilanza
      </h1>

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
          <button onClick={handleVerifica} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
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

          {tipoPresenza === 'Uscita' && (
            <div className="mt-4">
              <label className="block mb-1 font-semibold">Targa veicolo</label>
              <input
                type="text"
                value={targa}
                onChange={e => setTarga(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="es. AB123CD"
              />
               
               
               <div className="mt-4">
               <label className="block mb-1 font-semibold">chilometri</label>
              <input
                type="number"
                value={chilometri}
                onChange={e => setChilometri(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="20450"
              />
            </div>
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
