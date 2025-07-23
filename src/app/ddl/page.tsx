'use client';
import { useState } from 'react';

export default function DirettorePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dati, setDati] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Inserisci email e password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const text = await res.text();
      if (text === 'Unauthorized') {
        alert('Accesso negato: email o password errata.');
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
        <h2 className="text-xl font-bold mb-4">Accesso Direttore Lavori</h2>
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
      <h1 className="text-2xl font-bold mb-4">Riepilogo per {email}</h1>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr>
            {[
              'Nome',
              'Matricola',
              'Targa',
              'Presenze',
              'Assenze',
              'Ferie',
              'Malattia',
              'Infortunio',
              'CIG',
              'Permessi',
              'Rientro',
              'Festività',
              'Uscita',
            ].map((header, i) => (
              <th key={i} className="border px-2 py-1 bg-gray-100">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dati.map((riga, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{riga.nominativo}</td>
              <td className="border px-2 py-1">{riga.matricola}</td>
              <td className="border px-2 py-1">{riga.targa}</td>
              <td className="border px-2 py-1">{riga.presenze}</td>
              <td className="border px-2 py-1">{riga.assenze}</td>
              <td className="border px-2 py-1">{riga.ferie}</td>
              <td className="border px-2 py-1">{riga.malattia}</td>
              <td className="border px-2 py-1">{riga.infortunio}</td>
              <td className="border px-2 py-1">{riga.cig}</td>
              <td className="border px-2 py-1">{riga.permessi}</td>
              <td className="border px-2 py-1">{riga.rientro}</td>
              <td className="border px-2 py-1">{riga.festivita}</td>
              <td className="border px-2 py-1">{riga.uscita}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
