'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [testo, setTesto] = useState('');
  const [ok, setOk] = useState('');
  const [password, setPassword] = useState('');
  const [loggato, setLoggato] = useState(false);

  // Funzione per inviare il testo all'API
  const invia = async () => {
    const res = await fetch('/api/gas1-proxy1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testo }),
    });

    if (res.ok) {
      setOk('Inviato con successo!');
      setTesto('');
    }
  };

  // Funzione per controllare la password
  const login = () => {
    if (password === '6578@' || password === '8790@') {
      setLoggato(true);
      setPassword('');
    } else {
      alert('Password errata');
    }
  };

  return (
    <main className="p-4">
      {!loggato ? (
        // Schermata di login
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Inserisci password"
            className="border p-2 mr-2"
          />
          <button
            onClick={login}
            className="bg-green-500 text-white px-4 py-2"
          >
            Login
          </button>
        </div>
      ) : (
        // Schermata dopo il login
        <>
          <textarea
            value={testo}
            onChange={e => setTesto(e.target.value)}
            rows={4}
            className="border w-full p-2"
          />
          <button
            onClick={invia}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Invia
          </button>
          {ok && <p className="text-green-600 mt-2">{ok}</p>}
        </>
      )}
      <div className="mb-6">
        <Link href="/">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
            Home
          </button>
        </Link>
      </div>
    </main>
  );
}
