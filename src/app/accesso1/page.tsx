'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [distretto, setDistretto] = useState('');
  const [errore, setErrore] = useState('');

  const DISTRETTI = [
  {
    label: 'distretto1',
    value: 'distretto1',
  },
];

  const handleLogin = async () => {
    if (!email || !password || !distretto) {
      setErrore("Compila tutti i campi");
      return;
    }

    const res = await fetch(
      `/api/dato?email=${email}&password=${password}&distretto=${distretto}`
    );
    const data = await res.json();

    if (data.error || data.length === 0) {
      setErrore("Accesso negato o dati non trovati");
    } else {
      router.push(
        `/aib?email=${email}&password=${password}&distretto=${distretto}`
      );
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <input
        className="w-full border p-2 mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="w-full border p-2 mb-4"
        value={distretto}
        onChange={(e) => setDistretto(e.target.value)}
      >
        <option value="" disabled>
          -- Seleziona distretto --
        </option>

        {DISTRETTI.map(d => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        Accedi
      </button>

      {errore && <p className="text-red-600 mt-4">{errore}</p>}
    </div>
  );
}
