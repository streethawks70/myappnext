'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MappaLeaflet1 = dynamic(() => import('@/components/MappaLeaflet1'), { ssr: false });

const DISTRETTI = [
  'Distretto 1','Distretto 2','Distretto 3','Distretto 4','Distretto 5',
  'Distretto 6','Distretto 7','Distretto 8','Distretto 9','Distretto 10','Distretto 11',
];

const COLORI_STATO: Record<string, string> = {
  ferie: 'yellow',
  malattia: 'red',
  assente: 'black',
  permessi: 'purple',
  presente: 'green',
};

export default function DirettorePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [distretto, setDistretto] = useState('');
  const [dati, setDati] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lon: number; matricola: string } | null>(null);

  const caricaDati = async () => {
  if (!email || !password || !distretto) return;

  try {
    setLoading(true);
    const res = await fetch(
      `/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&distretto=${encodeURIComponent(distretto)}`
    );
    const text = await res.text();
    if (text === 'Unauthorized') {
      alert('Accesso negato.');
      setLoggedIn(false);
      return;
    }
    const json = JSON.parse(text);
    if (json.error) {
      alert(json.error);
      setLoggedIn(false);
      setDati([]);
    } else if (Array.isArray(json) && json.length > 0) {
      const datiConStato = json.map((riga: any) => {
        let stato = 'assente'; // default

        if (riga.presenze && riga.presenze.trim() !== '') stato = 'presente';
        else if (riga.assenze && riga.assenze.trim() !== '') stato = 'assente';
        else if (riga.malattia && riga.malattia.trim() !== '') stato = 'malattia';
        else if (riga.infortunio && riga.infortunio.trim() !== '') stato = 'infortunio';
        else if (riga.ferie && riga.ferie.trim() !== '') stato = 'ferie';
        else if (riga.permessi && riga.permessi.trim() !== '') stato = 'permessi';

        return { ...riga, stato };
      });

      setDati(datiConStato);
      setLoggedIn(true);
      setLastUpdate(new Date().toLocaleTimeString());
    } else {
      alert('Nessun dato trovato.');
      setLoggedIn(false);
      setDati([]);
    }
  } catch (err) {
    alert('Errore durante il recupero dati.');
    setLoggedIn(false);
    setDati([]);
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async () => {
    if (!email || !password || !distretto) {
      alert('Compila tutti i campi.');
      return;
    }
    await caricaDati();
  };

  useEffect(() => {
    if (!loggedIn) return;
    const interval = setInterval(() => {
      caricaDati();
    }, 30000);
    return () => clearInterval(interval);
  }, [loggedIn, email, password, distretto]);

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">👷‍💼 Accesso Direttore Lavori</h2>
        <select value={distretto} onChange={(e) => setDistretto(e.target.value)} className="w-full border px-4 py-2 mb-4">
          <option value="">Seleziona Distretto</option>
          {DISTRETTI.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
        <input type="email" placeholder="Email del direttore" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-4 py-2 mb-4" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-4 py-2 mb-4" />
        <button onClick={handleLogin} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded w-full">
          {loading ? 'Caricamento...' : 'Accedi'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="flex gap-4 mb-6">
        <Link href={{ pathname: '/Resoconto', query: { email, password, distretto } }}>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">Vai a ore Lavorate e Permessi</button>
        </Link>
      </div>

      {loading && <div className="text-sm text-gray-500 mb-2">⏳ Aggiornamento dati...</div>}
      {lastUpdate && !loading && <div className="text-sm text-gray-500 mb-2">✅ Ultimo aggiornamento: {lastUpdate}</div>}

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white max-h-[500px] overflow-y-auto">
        <table className="min-w-full text-sm text-gray-700 font-medium">
          <thead className="bg-green-100 text-green-900 text-xs uppercase tracking-wide sticky top-0 z-10 shadow">
            <tr>
              {['Data','Nome','Matricola','Comune','Targa','Presenze','Assenze','Ferie','Malattia','Infortunio','Cassa Int','Permessi','Rientro','Festività','Uscita'].map((header, i) => (
                <th key={i} className="px-3 py-3 text-center border-b border-green-300 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dati.map((riga, idx) => {
              const highlight = parseFloat(riga.assenze || 0) > 0 || parseFloat(riga.malattia || 0) > 0;
              return (
                <tr key={riga.matricola || idx} className={`hover:bg-green-50 ${highlight ? 'bg-red-50 text-red-700' : ''}`}>
                  <td className="px-3 py-2 text-left border-b border-gray-100">{riga.data}</td>
                  <td className="px-3 py-2 text-left border-b border-gray-100">{riga.nominativo}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.matricola}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.comune}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.targa}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.presenze}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.assenze}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.ferie}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.malattia}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.infortunio}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.cig}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.permessi}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.rientro}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.festivita}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.uscita}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-6">
        <div className="h-[500px] w-2/3 rounded-xl overflow-hidden shadow-lg">
          <MappaLeaflet1 dati={dati} selected={selected} coloriStato={COLORI_STATO} />
        </div>

        <div className="h-[500px] w-1/3 overflow-y-auto rounded-xl border p-4 shadow-md bg-white">
          <h3 className="font-semibold mb-3">Nominativi</h3>
          <ul className="space-y-2">
            {dati.map((item, idx) => (
              <li
                key={item.matricola || idx}
                className="p-2 rounded cursor-pointer hover:bg-green-100"
                onClick={() =>
                  item.lat && item.lon
                    ? setSelected({ lat: item.lat, lon: item.lon, matricola: item.matricola })
                    : null
                }
              >
                📍 {item.nominativo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
