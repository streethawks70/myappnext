'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type RigaPermesso = {
  nominativo: string;
  matricola: string;
  permesso_sind: string;
  permessi_vari: string;
  cassa_int: string;
  donazione_sangue: string;
};

export default function PermessiClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const password = searchParams.get('password') || '';
  const distretto = searchParams.get('distretto') || '';

  const [dati, setDati] = useState<RigaPermesso[]>([]);
  const [errore, setErrore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const caricaDati = async () => {
      try {
        const res = await fetch(`/api/dati?email=${email}&password=${password}&distretto=${distretto}`);
        const json = await res.json();

        if (!res.ok) {
          setErrore(json?.error || 'Errore sconosciuto');
        } else {
          setDati(json);
        }
      } catch (err) {
        setErrore('Errore di rete o server non raggiungibile');
      } finally {
        setLoading(false);
      }
    };

    caricaDati();
  }, [email, password, distretto]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Permessi – {distretto.toUpperCase()}
        </h1>
        <a href="/" className="text-sm text-blue-600 hover:underline">← Torna alla dashboard</a>
      </div>

      {loading && <div className="text-gray-500">Caricamento dati...</div>}
      {errore && <div className="text-red-600">{errore}</div>}

      {!loading && dati.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm max-h-[70vh] overflow-y-auto">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 border-b">Nominativo</th>
                <th className="px-4 py-2 border-b">Matricola</th>
                <th className="px-4 py-2 border-b text-yellow-600">Permesso Sindacale</th>
                <th className="px-4 py-2 border-b text-yellow-600">Permessi Vari</th>
                <th className="px-4 py-2 border-b text-yellow-600">Cassa Interna</th>
                <th className="px-4 py-2 border-b text-yellow-600">Donazione Sangue</th>
              </tr>
            </thead>
            <tbody>
              {dati.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 border-b">{row.nominativo}</td>
                  <td className="px-4 py-2 border-b">{row.matricola}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.permesso_sind}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.permessi_vari}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.cassa_int}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.donazione_sangue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
