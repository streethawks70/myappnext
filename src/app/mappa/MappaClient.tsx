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

  useEffect(() => {
    const caricaDati = async () => {
      try {
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
            };
          });

        setPosizioni(conCoordinate);
      } catch (err) {
        console.error('Errore caricamento dati:', err);
      }
    };

    caricaDati();
  }, [email, password, distretto]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mappa – {distretto.toUpperCase()}</h1>
      <div className="h-[600px] w-full border rounded overflow-hidden">
        <MappaLeafletComponent posizioni={posizioni} />
      </div>
    </div>
  );
}
