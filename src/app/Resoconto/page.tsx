'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; // ⬅️ IMPORT NECESSARIO

export default function ResocontoPage() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const password = params.get('password') || '';
  const distretto = params.get('distretto') || '';

  const [dati, setDati] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResoconto = async () => {
      try {
        const res = await fetch(
          `/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&distretto=${encodeURIComponent(distretto)}`
        );

        const json = await res.json();
        setDati(Array.isArray(json) ? json : []);
        console.log("✅ Dati ricevuti:", json);
      } catch (err) {
        console.error('Errore nel fetch dei dati del resoconto:', err);
        setDati([]);
      } finally {
        setLoading(false);
      }
    };

    if (email && password && distretto) {
      fetchResoconto();
    }
  }, [email, password, distretto]);

  if (loading) return <div className="p-6">Caricamento dati...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">📊 Resoconto Ore Lavorate e Permessi</h1>
      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white max-h-[500px] overflow-y-auto">
  <table className="min-w-full text-sm text-gray-700 font-medium">
    <thead className="bg-indigo-100 text-indigo-900 text-xs uppercase tracking-wide sticky top-0 z-10">

            <tr>
              {['Data', 'Nome', 'Ore giornaliere', 'Totale Ferie', 'Totale malattia','Totale perm Retr','Totale Legge 104','Totale art 9','Totale art 51'].map((header, i) => (
                <th key={i} className="px-3 py-3 text-center border-b border-indigo-300 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dati.map((riga, idx) => (
              <tr key={idx} className="hover:bg-indigo-50">
                <td className="px-3 py-2 border-b border-gray-100">{riga.data}</td>
                <td className="px-3 py-2 border-b border-gray-100">{riga.nominativo}</td>
                <td className="px-3 py-2 text-center border-b border-gray-100">{riga.ore_giornaliere}</td>
                <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_ferie}</td>
                <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_malattia}</td>
                 <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_perm_retr}</td>
                  <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_legge104}</td>
                   <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_art9}</td>
                    <td className="px-3 py-2 text-center border-b border-gray-100">{riga.totale_art51}</td>
                <td className="px-3 py-2 text-center border-b border-gray-100">
  {riga["ORE PERMESSI GIORNALIERI"]}
</td>


              </tr>
              
            ))}
          </tbody>
        </table>
        <div className="mb-6">
  <Link href="/">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
      Torna alla Home Page
    </button>
  </Link>
</div>
      </div>
    </div>
  );
}
