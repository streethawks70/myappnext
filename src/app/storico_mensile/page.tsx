"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RecordMensile {
  nominativo: string;
  matricola: string;
  [key: string]: string | number;
}

export default function StoricoMensilePage() {
  const [dati, setDati] = useState<RecordMensile[]>([]);
  const [loading, setLoading] = useState(false);
  const [mese, setMese] = useState("2025-09");
  const [distretto, setDistretto] = useState("distretto11");
  const [search, setSearch] = useState("");

  const fetchDati = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/storico_mensile?distretto=${distretto}&mese=${mese}`
      );
      const json = await res.json();
      setDati(json);
    } catch (err) {
      console.error(err);
      setDati([]);
    } finally {
      setLoading(false);
    }
  };
  //scarica exel
 const scaricaExcel = async () => {
  if (!dati || dati.length === 0) {
    alert("Nessun dato da scaricare");
    return;
  }

  const XLSX = await import("xlsx");

  const giorni = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const permessi = [
    "ferie",
    "malattia",
    "permessiRetribuiti",
    "art9",
    "art51",
    "legge104",
    "infortunio",
    "ore_mensili",
  ];

  const datiExport = dati.map((r) => {
    const row: any = {
      nominativo: r.nominativo ?? "",
      matricola: r.matricola ?? "",
    };

    // giorni
    giorni.forEach((g) => {
      row[g] = r[g] ?? "";
    });

    // permessi
    permessi.forEach((p) => {
      row[p] = r[p] ?? "";
    });

    return row;
  });

  const headers = ["nominativo", "matricola", ...giorni, ...permessi];

  const ws = XLSX.utils.json_to_sheet(datiExport, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Storico Mensile");

  XLSX.writeFile(wb, `storico_${distretto}_${mese}.xlsx`);
};


  useEffect(() => {
    fetchDati();
  }, []);

  const giorni = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const permessi = [
    "ferie",
    "malattia",
    "permessiRetribuiti",
    "art9",
    "art51",
    "legge104",
    "infortunio",
    "ore_mensili",
  ];

  const datiFiltrati = dati.filter(
    (r) =>
      r.nominativo.toLowerCase().includes(search.toLowerCase()) ||
      r.matricola.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📊 Storico Mensile - {mese} ({distretto})
      </h1>

      {/* FILTRI */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="month"
          value={mese}
          onChange={(e) => setMese(e.target.value)}
          className="border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-300"
        />
        <select
          value={distretto}
          onChange={(e) => setDistretto(e.target.value)}
          className="border rounded-lg px-3 py-2 shadow-sm focus:ring focus:ring-blue-300"
        >
          <option value="distretto1">Distretto 1</option>
          <option value="distretto2">Distretto 2</option>
          <option value="distretto3">Distretto 3</option>
          <option value="distretto4">Distretto 4</option>
          <option value="distretto5">Distretto 5</option>
          <option value="distretto6">Distretto 6</option>
          <option value="distretto8">Distretto 8</option>
          <option value="distretto9">Distretto 9</option>
          <option value="distretto10">Distretto 10</option>
          <option value="distretto11">Distretto 11</option>
        </select>
        <input
          type="text"
          placeholder="🔍 Cerca nominativo o matricola"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1 shadow-sm focus:ring focus:ring-blue-300"
        />
        <button
          onClick={fetchDati}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Carica
        </button>
      </div>
      <Link href="/Storico">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
           RITORNA A STORICO MENSILITA'
          </button>
        </Link>
        <div>
        <button
    onClick={scaricaExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
  >
    📥 Scarica Excel
  </button>
</div>

      {/* TABELLA */}
      {loading ? (
        <p className="text-gray-600">⏳ Caricamento…</p>
      ) : datiFiltrati.length === 0 ? (
        <p className="text-gray-600">⚠️ Nessun dato trovato</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-[1200px] border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-sm">
                <th className="border px-3 py-2">Nominativo</th>
                <th className="border px-3 py-2">Matricola</th>
                {giorni.map((g) => (
                  <th key={g} className="border px-2 py-1">
                    {g}
                  </th>
                ))}
                {permessi.map((p) => (
                  <th key={p} className="border px-2 py-1">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datiFiltrati.map((row, i) => (
                <tr
                  key={i}
                  className={`text-sm ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-yellow-100 transition`}
                >
                  <td className="border px-2 py-1 font-medium text-gray-800">
                    {row.nominativo}
                  </td>
                  <td className="border px-2 py-1 text-gray-600">
                    {row.matricola}
                  </td>
                  {giorni.map((g) => (
                    <td
                      key={g}
                      className="border px-2 py-1 text-center text-gray-700"
                    >
                      {row[g] ?? ""}
                    </td>
                  ))}
                  {permessi.map((p) => (
                    <td
                      key={p}
                      className="border px-2 py-1 text-center font-semibold text-blue-700"
                    >
                      {row[p] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
