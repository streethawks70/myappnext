"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

const distretti = ["distr1","distr2","distr3","distr4","distr5","distr6","distr7","distr8","distr9","distr10","distr11"];
const PRESET_EMAIL = "admin@calabriaverde.com";
const PRESET_PASSWORD = "KlY70";

export default function Home() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingLoginState, setLoadingLoginState] = useState(true); // Stato iniziale caricamento login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [distretto, setDistretto] = useState(distretti[0]);
  const [data, setData] = useState<Date | null>(new Date());
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Leggi login da localStorage
  useEffect(() => {
    const logged = localStorage.getItem("loggedIn");
    if (logged === "true") setLoggedIn(true);
    setLoadingLoginState(false);
  }, []);

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

  // Ricarica i file quando distretto/data cambiano o login avvenuto
  useEffect(() => {
    if (loggedIn) {
      fetchFiles();
    }
  }, [distretto, data, loggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === PRESET_EMAIL && password === PRESET_PASSWORD) {
      setLoggedIn(true);
      localStorage.setItem("loggedIn", "true");
      setLoginError(null);
    } else {
      setLoginError("Email o password errate");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedIn");
  };

  // Mostra caricamento iniziale login
  if (loadingLoginState) {
    return <p className="text-center mt-10">Caricamento...</p>;
  }

  // Schermata login
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
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
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

  // Pagina principale dopo login
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">Visualizza Fogli Presenze</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
        >
          Logout
        </button>
      </div>

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

      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() =>
            router.push(`/Storicooperaio?distretto=${encodeURIComponent(distretto)}`)
          }
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
        >
          Vai al Resoconto
        </button>
        <button
          onClick={() =>
            router.push(`/storico_mensile?distretto=${encodeURIComponent(distretto)}`)
          }
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
        >
          Vai al Riepilogo mensile distretto
        </button>
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
        !loading && <p className="text-center text-gray-500">Nessun file trovato</p>
      )}
    </div>
  );
}
