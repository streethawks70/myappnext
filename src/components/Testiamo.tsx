"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const distretti = ["distr11", "distr2", "distr3"];

const PRESET_EMAIL = "admin@calabriaverde.com";
const PRESET_PASSWORD = "KlY70";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [distretto, setDistretto] = useState(distretti[0]);
  const [data, setData] = useState<Date | null>(new Date());
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!data) return;
    setLoading(true);
    setError(null);
    try {
      const dataStr = data.toISOString().split("T")[0];
      const res = await fetch(
        `/api/list?distretto=${distretto}&data=${dataStr}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Errore server ${res.status}`);
      }
      const dataJson = await res.json();
      if (Array.isArray(dataJson)) {
        setFiles(dataJson);
      } else if (dataJson.error) {
        setError(dataJson.error);
        setFiles([]);
      } else {
        setFiles([]);
      }
    } catch (err: any) {
      setError(err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchFiles();
    }
  }, [distretto, data, loggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === PRESET_EMAIL && password === PRESET_PASSWORD) {
      setLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError("Email o password errate");
    }
  };

  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pagina dopo login
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Visualizza Fogli Presenze
      </h1>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div>
          <label className="block text-gray-700 mb-1">Distretto</label>
          <select
            value={distretto}
            onChange={(e) => setDistretto(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {distretti.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Data</label>
          <DatePicker
            selected={data}
            onChange={(date) => setData(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Caricamento file...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
            >
              <span className="text-gray-800 font-medium">{f.name}</span>
              <div className="flex gap-4">
                {/* Pulsante per visualizzare */}
                {f.webViewLink && (
                  <a
                    href={f.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Visualizza
                  </a>
                )}
                {/* Pulsante per scaricare */}
                {f.webContentLink && (
                  <a
                    href={f.webContentLink}
                    download={f.name}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Download
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <p className="text-center text-gray-500">Nessun file trovato</p>
        )
      )}
    </div>
  );
}
