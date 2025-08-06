'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type RigaPermesso = {
  nominativo: string;
  matricola: string;
  totale_ore_mens: string;
  totale_perm_retr: string;
  totale_legge104: string;
  totale_art9: string;
  totale_art51:string;
  totale_ferie:string;
  totale_mal:string;
  totale_inf:string;
  totale_donaz:string;
  totale_perm_sind:string;
  totale_cassa_int:string;
  totale_festivita:string;
  totale_perm_elett:string;
  totale_perm_pioggia:string;
  totale_perm_lutto:string;

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
                <th className="px-4 py-2 border-b text-yellow-600">Totale Ore Mensili</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Permessi retr</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale 104</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Art9</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Art51</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Ferie</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Malattia</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Infortunio</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Don. sangue</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Perm. Sind</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Cassa Int</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Festivita</th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Permesso El. </th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Permesso Pioggia </th>
                <th className="px-4 py-2 border-b text-yellow-600">Totale Permesso Lutto </th>
              </tr>
            </thead>
            <tbody>
              {dati.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 border-b">{row.nominativo}</td>
                  <td className="px-4 py-2 border-b">{row.matricola}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.totale_ore_mens}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.totale_perm_retr}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.totale_legge104}</td>
                  <td className="px-4 py-2 border-b text-yellow-600">{row.totale_art9}</td>
                   <td className="px-4 py-2 border-b text-yellow-600">{row.totale_art51}</td>
                   <td className="px-4 py-2 border-b text-yellow-600">{row.totale_ferie}</td>
                   <td className="px-4 py-2 border-b text-yellow-600">{row.totale_mal}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_inf}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_donaz}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_perm_sind}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_cassa_int}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_festivita}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_perm_elett}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_perm_pioggia}</td>
                    <td className="px-4 py-2 border-b text-yellow-600">{row.totale_perm_lutto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
