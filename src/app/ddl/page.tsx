'use client';
import { useState } from 'react';

export default function DirettorePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dati, setDati] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Funzione che converte la data ISO in numero decimale ore + aggiunge 1h di fuso
  function isoStringToDecimalHours(isoString: string) {
    if (!isoString) return 0;
    const date = new Date(isoString);
    const baseDate = new Date('1899-12-30T00:00:00.000Z');
    let diffMs = date.getTime() - baseDate.getTime();

    // Aggiungi 1 ora (3600000 ms) per correggere il fuso orario
    diffMs += 3600000;

    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  }

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
      } else {
        let json;
        try {
          json = JSON.parse(text);
        } catch (err) {
          console.error('Errore nel parsing della risposta JSON:', err);
          alert('Risposta non valida dal server.');
          return;
        }

        if (Array.isArray(json)) {
          setDati(json);
          setLoggedIn(true);
        } else {
          console.warn('Formato risposta non previsto:', json);
          alert('Errore: risposta inattesa dal server.');
        }
      }
    } catch (err) {
      console.error('Errore nel recupero dati:', err);
      alert('Errore nel recupero dati.');
    } finally {
      setLoading(false);
    }
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
          {Array.isArray(dati) &&
            dati.map((riga, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{riga.nominativo}</td>
                <td className="border px-2 py-1">{riga.matricola}</td>
                <td className="border px-2 py-1">{riga.targa}</td>

                {/* Qui converto presenza da ISO string a decimale con +1 ora */}
                <td className="border px-2 py-1">
                  {isoStringToDecimalHours(riga.presenze).toFixed(2)}
                </td>

                <td className="border px-2 py-1">{riga.assenze}</td>
                <td className="border px-2 py-1">{riga.ferie}</td>
                <td className="border px-2 py-1">{riga.malattia}</td>
                <td className="border px-2 py-1">{riga.infortunio}</td>
                <td className="border px-2 py-1">{riga.cig}</td>
                <td className="border px-2 py-1">{riga.permessi}</td>
                <td className="border px-2 py-1">{riga.rientro}</td>
                <td className="border px-2 py-1">{riga.festivita}</td>

                {/* Anche per uscita */}
                <td className="border px-2 py-1">
                  {isoStringToDecimalHours(riga.uscita).toFixed(2)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
