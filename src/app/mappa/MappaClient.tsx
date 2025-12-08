"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Posizione } from "@/components/MappaLeaflet";
import Link from 'next/link'; 
import DistrettoSelector from "@/components/DistrettoSelector";

const MappaLeafletComponent = dynamic(() => import("@/components/MappaLeaflet"), { ssr: false });

export default function MappaPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const distretto = searchParams.get("distretto") || "";

  const [posizioni, setPosizioni] = useState<Posizione[]>([]);
  const [search, setSearch] = useState("");
  const [statoFiltro, setStatoFiltro] = useState<string>("tutti");
  const [comuneFiltro, setComuneFiltro] = useState<string>("tutti");
  const [loading, setLoading] = useState(false);
  const [attivaClickPartenza, setAttivaClickPartenza] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const caricaDati = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/dati?email=${email}&password=${password}&distretto=${distretto}`);
        const json = await res.json();
        json.forEach((r: any) => {
  console.log("DEBUG RIGA:", r.nominativo, r["Donazione sangue"]);
});

        const conCoordinate = json
          .filter((r: any) => r.posizione)
          .map((r: any) => {
            // console.log("DEBUG STATO:", r.nominativo, "→", r.stato);
            const [lat, lng] = r.posizione.split(",").map((s: string) => parseFloat(s.trim()));
            return {
              nome: r.nominativo,
              lat,
              lng,
            stato: (() => {
  // Se la colonna L (cassa integrazione) contiene un valore → è cassa integrazione
  if (r.cassa_int && r.cassa_int.toString().trim() !== "") {
    return "cassa_integrazione";
  }

  // Se la colonna J (donazione sangue) contiene un valore → è donazione sangue
  if (r.donazione_sangue && r.donazione_sangue.toString().trim() !== "") {
    return "donazione_sangue";
  }

  // Se la colonna i (donazione sangue) contiene un valore → è infortunio
  if (r.infortunio && r.infortunio.toString().trim() !== "") {
    return "infortunio";
  }
  // Se la colonna k (permesso sindacale) contiene un valore → è permesse sindacale
  if (r.permesso_sind && r.permesso_sind.toString().trim() !== "") {
    return "permesso_sindacale";
  }
  // Altrimenti usa lo stato normale
  const s = r.stato ? r.stato.toString().trim().toLowerCase() : "";

  return (s || "assente") as
    | "presente"
    | "assente"
    | "ferie"
    | "malattia"
    | "permessi"
    | "cassa_integrazione"
    | "donazione_sangue"
    | "infortunio"
    |"permesso_sindacale";
})(),



              comune: r.comune || "",
               matricola: r.matricola || "",
               direttore_lavori:r.direttore_lavori || "",
               chilometri_percorsi:r.chilometri_percorsi ||"",
               data:r.data ||"",
               distretto:r.distretto ||"",
      
      
               
               
            };
          });

        setPosizioni(conCoordinate);
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    };

    caricaDati();
    interval = setInterval(caricaDati, 30000);
    return () => clearInterval(interval);
  }, [email, password, distretto]);

  // 🔹 Applichiamo i filtri
  const posizioniFiltrate = posizioni.filter((p) => {
    const matchNome = p.nome.toLowerCase().includes(search.toLowerCase());
    const matchStato = statoFiltro === "tutti" || p.stato === statoFiltro;
    const matchComune = comuneFiltro === "tutti" || p.comune === comuneFiltro;
    return matchNome && matchStato && matchComune;
  });

  // 🔹 Estraiamo i comuni unici
  const comuniUnici = ["tutti", ...Array.from(new Set(posizioni.map((p) => p.comune)))];

  // 🔹 Calcoliamo i contatori per stato
  const contatori = useMemo(() => {
    const counts: Record<string, number> = {
      presente: 0,
      assente: 0,
      ferie: 0,
      malattia: 0,
      permessi: 0,
      cassa_integrazione: 0,
      donazione_sangue : 0,
      infortunio :0,
      permesso_sindacale:0,
    };
    for (const p of posizioniFiltrate) {
      if (p.stato && counts[p.stato] !== undefined) {
        counts[p.stato]++;
      }
    }
    return counts;
  }, [posizioniFiltrate]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mappa – {distretto.toUpperCase()}</h1>

      {/* 🔹 Barra filtri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Cerca nominativo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          value={statoFiltro}
          onChange={(e) => setStatoFiltro(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="tutti">Tutti gli stati</option>
          <option value="presente">Presente</option>
          <option value="assente">Assente</option>
          <option value="ferie">Ferie</option>
          <option value="malattia">Malattia</option>
          <option value="permessi">Permessi</option>
          <option value="cassa_integrazione">Cassa_integrazione</option>
          <option value="donazione_sangue">Donazione_sangue</option>
          <option value="infortunio">infortunio</option>
          <option value="permesso_sindacale">permesso_sindacale</option>
        </select>

        <select
          value={comuneFiltro}
          onChange={(e) => setComuneFiltro(e.target.value)}
          className="border p-2 rounded w-full"
        >
          {comuniUnici.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Contatori dinamici */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm font-medium">
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
          Presenti: {contatori.presente}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
          Assenti: {contatori.assente}
        </span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          Ferie: {contatori.ferie}
        </span>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
          Malattia: {contatori.malattia}
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          Permessi: {contatori.permessi}
        </span>
         <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full">
          Cassa_integrazione: {contatori.cassa_integrazione}
        </span>
         <span className="px-3 py-1 bg-orange-100 text-orange-400 rounded-full">
          Donazione_sangue: {contatori.donazione_sangue}
        </span>
         <span className="px-3 py-1 bg-pink-100 text-pink-400 rounded-full">
          infortunio: {contatori.infortunio}
        </span>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
          permesso_sindacale: {contatori.permesso_sindacale}
        </span>
      </div>
      <div className="mb-2 flex items-center space-x-1 text-sm">
  <input
    type="checkbox"
    checked={attivaClickPartenza}
    onChange={() => setAttivaClickPartenza(!attivaClickPartenza)}
    className="w-4 h-4"
  />
  <span>Attiva click per punto di partenza</span>
</div>

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
      {/* Pulsante Modalità Replay */}
{email && password && distretto && (
  <div className="mb-4">
    <Link
      href={`/replay?email=${email}&password=${password}&distretto=${distretto}`}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
    >
      Modalità Replay
    </Link>
  </div>
)}


      <div className="h-[600px] w-full border rounded overflow-hidden">
        <MappaLeafletComponent posizioni={posizioniFiltrate}
        attivaClickPartenza={attivaClickPartenza} 
         />
      </div>
    </div>
  );
}
