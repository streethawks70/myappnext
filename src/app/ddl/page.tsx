'use client';
import { useState } from 'react';
import Link from 'next/link'; // ⬅️ IMPORT NECESSARIO

const DISTRETTI = [
  'Distretto 1',
  'Distretto 2',
  'Distretto 3',
  'Distretto 4',
  'Distretto 5',
  'Distretto 6',
  'Distretto 7',
  'Distretto 8',
  'Distretto 9',
  'Distretto 10',
  'Distretto 11',
];

export default function DirettorePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [distretto, setDistretto] = useState('');
  const [dati, setDati] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !distretto) {
      alert('Compila tutti i campi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&distretto=${encodeURIComponent(distretto)}`
      );

      const text = await res.text();

      if (text === 'Unauthorized') {
        alert('Accesso negato.');
        setLoading(false);
        return;
      }

      const json = JSON.parse(text);
      if (json.error) {
        alert(json.error);
        setLoggedIn(false);
        setDati([]);
      } else if (Array.isArray(json) && json.length > 0) {
        setDati(json);
        setLoggedIn(true);
      } else {
        alert('Nessun dato trovato.');
        setLoggedIn(false);
        setDati([]);
      }
    } catch (err) {
      alert('Errore durante il recupero dati.');
      setLoggedIn(false);
      setDati([]);
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4"> 👷‍💼  Accesso Direttore Lavori </h2>

        <select
          value={distretto}
          onChange={(e) => setDistretto(e.target.value)}
          className="w-full border px-4 py-2 mb-4"
        >
          <option value="">Seleziona Distretto</option>
          {DISTRETTI.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>

        <input
          type="email"
          placeholder="Email del direttore"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 mb-4"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Caricamento...' : 'Accedi'}
        </button>
      </div>
    );
  }

  return (
  <div className="max-w-6xl mx-auto mt-10 p-4">
    <div className="mb-6">
      <Link
  href={{
    pathname: '/Resoconto',
    query: {
      email,
      password,
      distretto,
    },
  }}
>
  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
    Vai a ore Lavorate e permessi
  </button>
</Link>

    </div>

    <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white max-h-[500px] overflow-y-auto">
  <table className="min-w-full text-sm text-gray-700 font-medium">
    <thead className="bg-green-100 text-green-900 text-xs uppercase tracking-wide sticky top-0 z-10 shadow">

          <tr>
            {[
              'Data',
              'Nome',
              'Matricola',
              'Targa',
              'Presenze',
              'Assenze',
              'Ferie',
              'Malattia',
              'Infortunio',
              'Cassa Int',
              'Permessi',
              'Rientro',
              'Festività',
              'Uscita',
            ].map((header, i) => (
              <th
                key={i}
                className="px-3 py-3 text-center border-b border-green-300 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dati.map((riga, idx) => {
            const highlight =
              parseFloat(riga.assenze || 0) > 0 ||
              parseFloat(riga.malattia || 0) > 0;

            return (
              <tr
                key={idx}
                className={`hover:bg-green-50 ${
                  highlight ? 'bg-red-50 text-red-700' : ''
                }`}
              >
                <td className="px-3 py-2 text-left border-b border-gray-100">{riga.data}</td>
                <td className="px-3 py-2 text-left border-b border-gray-100">{riga.nominativo}</td>
                <td className="px-3 py-2 text-center border-b border-gray-100">{riga.matricola}</td>
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
  </div>
);
}