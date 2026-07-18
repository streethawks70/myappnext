"use client";

import { useEffect, useState } from "react";

export default function ListiniPage() {
  const [data, setData] = useState<
    string[][]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [distretto, setDistretto] =
    useState("");

  const [unlocked, setUnlocked] =
    useState(false);

  // PASSWORD PER DISTRETTO
  const PASSWORDS: Record<
    string,
    string
  > = {
    distretto1: "roma123",
    distretto2: "milano123",
    distretto3: "napoli123",
    distretto4: "torino123",
    distretto5: "bologna123",
    distretto6: "genova123",
    distretto8: "firenze123",
    distretto9: "palermo123",
    distretto10: "venezia123",
    distretto11: "bari123",
  };

  const fetchData = async () => {
    if (!distretto) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/listini?distretto=${distretto}`
      );

      const json = await res.json();

      if (!res.ok) {
        alert(
          json?.error ||
            "Errore caricamento"
        );

        setData([]);

        return;
      }

      if (Array.isArray(json)) {
        setData(json);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);

      alert(
        "Errore connessione API"
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD DISTRETTO
  const handleDistrettoChange = (
    newDistretto: string
  ) => {
    const password = prompt(
      `Inserisci password per ${newDistretto}`
    );

    if (
      password ===
      PASSWORDS[newDistretto]
    ) {
      setUnlocked(true);

      setDistretto(newDistretto);
    } else {
      alert("❌ Password errata");
    }
  };

  useEffect(() => {
    if (unlocked && distretto) {
      fetchData();
    }
  }, [distretto, unlocked]);

  const updateCell = (
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => {
    const updated = [...data];

    if (!updated[rowIndex]) {
      updated[rowIndex] = [];
    }

    updated[rowIndex][cellIndex] =
      value;

    setData(updated);
  };

  const addRow = () => {
    const columns =
      data[0]?.length || 5;

    const newRow = Array(
      columns
    ).fill("");

    setData([...data, newRow]);
  };

  const salva = async () => {
    try {
      const res = await fetch(
        "/api/listini",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            distretto,
            values: data,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        alert(
          json?.error ||
            "Errore salvataggio"
        );

        return;
      }

      alert(
        "✅ Listino salvato"
      );
    } catch (err) {
      console.error(err);

      alert(
        "❌ Errore salvataggio"
      );
    }
  };
  const deleteRow = (rowIndex: number) => {
  if (!confirm(`Eliminare la riga ${rowIndex + 1}?`)) return;

  setData((prev) =>
    prev.filter((_, i) => i !== rowIndex)
  );
};

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <h1 className="text-3xl font-bold">
          📦 Gestione Listini
        </h1>

        <select
          value={distretto}
          onChange={(e) =>
            handleDistrettoChange(
              e.target.value
            )
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="">
            Seleziona Distretto
          </option>

          <option value="distretto1">
            Distretto 1
          </option>

          <option value="distretto2">
            Distretto 2
          </option>

          <option value="distretto3">
            Distretto 3
          </option>

          <option value="distretto4">
            Distretto 4
          </option>

          <option value="distretto5">
            Distretto 5
          </option>

          <option value="distretto6">
            Distretto 6
          </option>

          <option value="distretto8">
            Distretto 8
          </option>

          <option value="distretto9">
            Distretto 9
          </option>

          <option value="distretto10">
            Distretto 10
          </option>

          <option value="distretto11">
            Distretto 11
          </option>
        </select>

        <button
          onClick={fetchData}
          disabled={!unlocked}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          🔄 Ricarica
        </button>

        <button
          onClick={addRow}
          disabled={!unlocked}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          ➕ Riga
        </button>

        <button
          onClick={salva}
          disabled={!unlocked}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          💾 Salva
        </button>
      </div>

      {!unlocked ? (
        <p>
          🔒 Seleziona un distretto
          per inserire la password
        </p>
      ) : loading ? (
        <p>⏳ Caricamento...</p>
      ) : data.length === 0 ? (
        <p>
          ⚠️ Nessun dato trovato
        </p>
      ) : (
        <div className="overflow-auto border rounded-lg shadow max-h-[80vh]">
          <table className="border-collapse min-w-full">
            <tbody>
              {data.map(
                (
                  row,
                  rowIndex
                ) => {
                  const isEmpty =
                    !row ||
                    !row.some(
                      (cell) =>
                        cell &&
                        cell
                          .toString()
                          .trim() !== ""
                    );

                  if (isEmpty)
                    return null;

                  return (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex %
                          2 ===
                        0
                          ? "bg-gray-50"
                          : "bg-white"
                      }
                    >
                      {row.map(
                        (
                          cell,
                          cellIndex
                        ) => (
                         <td
  key={cellIndex}
  className="border p-1 min-w-[300px]"
>
                            <input
                              value={
                                cell || ""
                              }
                              onChange={(
                                e
                              ) =>
                                updateCell(
                                  rowIndex,
                                  cellIndex,
                                  e.target
                                    .value
                                )
                              }
                              className="w-full p-2 outline-none bg-transparent"
                            />
                          </td>
                        )
                      )}
                      <td className="border p-1 text-center">
  <button
    onClick={() => deleteRow(rowIndex)}
    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
  >
    🗑️
  </button>
</td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}