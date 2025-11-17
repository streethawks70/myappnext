"use client";

import { useState, useEffect } from "react";

type RigaDati = {
  data: string;
  nominativo: string;
  matricola: string;
  comune: string;
  targa: string;
  presenze: string;
  assenze: string;
  ferie: string;
  malattia: string;
  infortunio: string;
  donazione_sangue: string;
  permesso_sind: string;
  cassa_int: string;
  permessi_vari: string;
  festivita: string;
  uscita: string;
  posizione: string;
  distretto: string;
};

export default function Page() {
  // ---------------- LOGIN ----------------
  const PRESET_EMAIL = "alfonsofalcomata57@gmail.com";
  const PRESET_PASSWORD = "123QwEzXcAsD";

  const [loggedIn, setLoggedIn] = useState(false);
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailLogin === PRESET_EMAIL && passwordLogin === PRESET_PASSWORD) {
      setLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError("Email o password errate");
    }
  };

  // ---------------- FORM CORREZIONI ----------------
  const [nome, setNome] = useState("");
  const [stato, setStato] = useState("");
  const [valore, setValore] = useState("");
  const [distretto, setDistretto] = useState("Distretto 1"); // default

  const sheetUrls: Record<string, string> = {
    "Distretto 1": "https://script.google.com/macros/s/AKfycbyZfVE8nYFQ_finiOyVc3WJagoPSQf8dtX0dsDhcYfVRiCjqhwNqM9krxpiMdGQIf5JZg/exec",
    "Distretto 2": "URL_APPS_SCRIPT_DISTRETTO2",
    "Distretto 3": "https://script.google.com/macros/s/AKfycbzsJok6SIe7JY9hP8z2DF66pGesdtqv1rFcmCJ3437w-WnRaaO5ebcWfbhnd_FynlVR/exec",
    "Distretto 5": "https://script.google.com/macros/s/AKfycbyu_nl4bIkaybBunDavAJLmMZz6FJpNn3jB7fe7RyVY-Q_FSstc8eghxGW3qxE4cWBg/exec",
    "Distretto 6": "https://script.google.com/macros/s/AKfycbz4f93rnFXOnffim67xhsd1wr44Lp0m_ShJUYQ_UUst14h4_Kc5BgZ0zJzBC7S1cbmp/exec",
    "Distretto 8": "https://script.google.com/macros/s/AKfycbxn8Usq4RmRPsoPUmnU8Qt3orrzwTWltjgYilCjRTEMjhYxbZekGftFrAyXDpzzmR0nHQ/exec",
    "Distretto 9": "https://script.google.com/macros/s/AKfycbx2vPrIQNj8syqp49yNLg-almN4XGNYuiFI4mZOZUwA0yjS6iUEh83Gsi1aI1YOH6hI4g/exec",
    "Distretto 10": "https://script.google.com/macros/s/AKfycbwm5i-hnm8a0-iez_Z23eFdIcT4KRweq9iLEQBNIV5cMq37bB5CEG3kiUX9wQD2Tzt2/exec",
    "Distretto 13": "https://script.google.com/macros/s/AKfycbxzK5ddO1PPo5PAoK4OY7kEpC2bc7tHV7Cf01w6Tp8jdefDhtHtT2ooZ5iLYSqk5LF0/exec",
    "Distretto 14": "https://script.google.com/macros/s/AKfycbxShFke0iGHahl7bCmvkToUYWI2PBDt-N_Dsr3r1xR1xQqO8UIx3XOKYig1mJ2-IH5-Aw/exec",
  };

  const DISTRETTO_KEYS: Record<string, string> = {
    "Distretto 1": "distretto1",
    "Distretto 2": "distretto2",
    "Distretto 3": "distretto3",
    "Distretto 5": "distretto5",
    "Distretto 6": "distretto6",
    "Distretto 8": "distretto8",
    "Distretto 9": "distretto9",
    "Distretto 10": "distretto10",
    "Distretto 13": "distretto11",
    "Distretto 14": "distretto14",
  };

  // ---------------- TABELLA ----------------
  const [dati, setDati] = useState<RigaDati[]>([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<Date | null>(null);

  // ---------------- FUNZIONE FETCH DATI ----------------
  const fetchDati = async () => {
    setUpdating(true);
    const key = DISTRETTO_KEYS[distretto];
    if (!key) {
      setErrore("Distretto non configurato per la fetch dati");
      setLoading(false);
      setUpdating(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/dati?email=${encodeURIComponent(emailLogin)}&password=${encodeURIComponent(passwordLogin)}&distretto=${encodeURIComponent(key)}`
      );
      const json = await res.json();

      if (!res.ok) {
        setErrore(json?.error || "Errore server");
        setDati([]);
      } else {
        setErrore(null);
        setDati(json);
        setUltimoAggiornamento(new Date());
      }
    } catch (err) {
      console.error(err);
      setErrore("Errore di rete");
      setDati([]);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;

    fetchDati();
    const interval = setInterval(fetchDati, 30000); // auto-refresh ogni 30s
    return () => clearInterval(interval);
  }, [loggedIn, distretto, emailLogin, passwordLogin]);

  // ---------------- INVIO CORREZIONE ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = sheetUrls[distretto];
    if (!url) {
      alert("URL del distretto non configurato!");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("action", "correzione");
    formData.append("nome", nome);
    formData.append("stato", stato);
    formData.append("valore", valore);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const text = await res.text();
      alert(text);
    } catch (err) {
      console.error(err);
      alert("Errore durante la correzione");
    }
  };

  // ---------------- RENDER ----------------
  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={passwordLogin}
              onChange={(e) => setPasswordLogin(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
            {loginError && <p className="text-red-500">{loginError}</p>}
            <button className="w-full bg-blue-600 text-white p-2 rounded">Accedi</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Correzioni – {distretto}</h1>

      {/* FORM CORREZIONE */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-4 flex flex-col gap-4 max-w-md">
        <select value={distretto} onChange={(e) => setDistretto(e.target.value)} className="border p-2 rounded">
          {Object.keys(sheetUrls).map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="border p-2 rounded" required />

        <select value={stato} onChange={(e) => setStato(e.target.value)} className="border p-2 rounded" required>
          <option value="">-- Stato --</option>
          <option value="Presenza">Presenza</option>
          <option value="Assenza">Assenza</option>
          <option value="Ferie">Ferie</option>
          <option value="Malattia">Malattia</option>
          <option value="Infortunio">Infortunio</option>
          <option value="Donazione sangue">Donazione sangue</option>
          <option value="Permesso sindacale">Permesso sindacale</option>
          <option value="Cassa integrazione">Cassa integrazione</option>
          <option value="Permessi Vari">Permessi Vari</option>
          <option value="Festività">Festività</option>
          <option value="Uscita">Uscita</option>
        </select>

        <input type="text" placeholder="Valore" value={valore} onChange={(e) => setValore(e.target.value)} className="border p-2 rounded" required />

        <button className="bg-blue-600 text-white p-2 rounded">Applica Correzione</button>
      </form>

      {/* INDICATORE ULTIMO AGGIORNAMENTO */}
      {ultimoAggiornamento && (
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <span>Ultimo aggiornamento: {ultimoAggiornamento.toLocaleTimeString()}</span>
          {updating && <span className="animate-pulse text-blue-500">⟳ Aggiornamento...</span>}
        </div>
      )}

      {/* TABELLA DASHBOARD */}
      {loading ? (
        <p>Caricamento dati...</p>
      ) : errore ? (
        <p className="text-red-500">{errore}</p>
      ) : dati.length === 0 ? (
        <p>Nessun dato trovato</p>
      ) : (
        <div className="overflow-x-auto border rounded max-h-[60vh]">
  <table className="min-w-[1200px] text-sm border-collapse">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th className="p-2 border">Data</th>
        <th className="p-2 border">Nominativo</th>
        <th className="p-2 border">Matricola</th>
        <th className="p-2 border">Comune</th>
        <th className="p-2 border">Targa</th>
        <th className="p-2 border">Entrata</th>
        <th className="p-2 border">Uscita</th>
        <th className="p-2 border">Assenze</th>
        <th className="p-2 border">Ferie</th>
        <th className="p-2 border">Malattia</th>
        <th className="p-2 border">Infortunio</th>
        <th className="p-2 border">Donazione Sangue</th>
        <th className="p-2 border">Permesso Sindacale</th>
        <th className="p-2 border">Cassa Interna</th>
        <th className="p-2 border">Permessi Vari</th>
        <th className="p-2 border">Festività</th>
      </tr>
    </thead>
    <tbody>
      {dati.map((row, i) => (
        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
          <td className="p-2 border">{row.data}</td>
          <td className="p-2 border">{row.nominativo}</td>
          <td className="p-2 border">{row.matricola}</td>
          <td className="p-2 border">{row.comune}</td>
          <td className="p-2 border">{row.targa}</td>
          <td className="p-2 border text-green-700">{row.presenze}</td>
          <td className="p-2 border text-green-700">{row.uscita}</td>
          <td className="p-2 border text-red-600">{row.assenze}</td>
          <td className="p-2 border">{row.ferie}</td>
          <td className="p-2 border">{row.malattia}</td>
          <td className="p-2 border">{row.infortunio}</td>
          <td className="p-2 border">{row.donazione_sangue}</td>
          <td className="p-2 border">{row.permesso_sind}</td>
          <td className="p-2 border">{row.cassa_int}</td>
          <td className="p-2 border">{row.permessi_vari}</td>
          <td className="p-2 border">{row.festivita}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      )}
    </div>
  );
}
