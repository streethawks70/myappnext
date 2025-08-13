"use client";

import React, { useState } from "react";
import ComunicazioniComponent from "../../components/ComunicazioniComponent";
import { MessagesProvider } from "../../components/context/MessagesContext";
import Link from "next/link";

const DISTRETTI = [
  "distretto1",
  "distretto2",
  "distretto3",
  "distretto4",
  "distretto5",
  "distretto6",
  "distretto7",
  "distretto8",
  "distretto9",
  "distretto10",
  "distretto11",
];

export default function Home() {
  const [mode, setMode] = useState<"invia" | "stato" | "dl" | null>(null);
  const [distretto, setDistretto] = useState<string>(DISTRETTI[0]);

  return (
    <MessagesProvider>
      <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
        <h1 className="text-2xl font-bold mb-4">Richiesta Giustificativi</h1>

        {!mode && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Seleziona Distretto</label>
              <select
                className="border p-2 rounded w-full"
                value={distretto}
                onChange={(e) => setDistretto(e.target.value)}
              >
                {DISTRETTI.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded"
                onClick={() => setMode("invia")}
              >
                📤 Invia richiesta
              </button>
              <button
                className="bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => setMode("stato")}
              >
                👀 Visualizza stato
              </button>
              <button
                className="bg-green-600 text-white py-2 px-4 rounded"
                onClick={() => setMode("dl")}
              >
                ✅ Convalida richieste (DL)
              </button>
              <div className="mb-6">
  <Link href="/">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">
      Ritorna a Presenze
    </button>
  </Link>
</div>

            </div>
          </>
        )}

        {mode && (
          <ComunicazioniComponent
            mode={mode}
            distretto={distretto}
            onClose={() => setMode(null)}
          />
        )}
      </div>
    </MessagesProvider>
  );
}
