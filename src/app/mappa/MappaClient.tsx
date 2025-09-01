'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Posizione } from '@/components/MappaLeaflet';

const MappaLeafletComponent = dynamic(() => import('@/components/MappaLeaflet'), { ssr: false });

export default function MappaPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const password = searchParams.get('password') || '';
  const distretto = searchParams.get('distretto') || '';

  const [posizioni, setPosizioni] = useState<Posizione[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const caricaDati = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dati?email=${email}&password=${password}&distretto=${distretto}`);
        const json = await res.json();

        const conCoordinate = json
          .filter((r: any) => r.posizione)
          .map((r: any) => {
            const [lat, lng] = r.posizione.split(',').map((s: string) => parseFloat(s.trim()));
            return {
              nome: r.nominativo,
              lat,
              lng,
              stato: r.stato?.toLowerCase() as
                | 'presente'
                | 'assente'
                | 'ferie'
                | 'malattia'
                | 'permessi'
                | undefined,
              comune: r.comune || '',
            };
          });

        setPosizioni(conCoordinate);
      } catch (err) {
        console.error('Errore caricamento dati:', err);
      } finally {
        setLoading(false);
      }
    };

    // prima chiamata subito
    caricaDati();

    // polling ogni 30 secondi
    interval = setInterval(caricaDati, 30000);

    return () => clearInterval(interval);
  }, [email, password, distretto]);

  const posizioniFiltrate = posizioni.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mappa – {distretto.toUpperCase()}</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Cerca nominativo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* 🔄 Indicatore di caricamento */}
      {loading && (
        <div className="flex items-center justify-center mb-2 text-gray-600">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            />
          </svg>
          Aggiornamento dati in corso...
        </div>
      )}

      <div className="h-[600px] w-full border rounded overflow-hidden">
        <MappaLeafletComponent posizioni={posizioniFiltrate} />
      </div>
    </div>
  );
}
