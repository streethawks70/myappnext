'use client';

import { useState } from "react";

const Correzioni = () => {
  // ✅ LOGIN
  const PRESET_EMAIL = "admin@calabriaverde.com";
  const PRESET_PASSWORD = "KlY70";

  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === PRESET_EMAIL && password === PRESET_PASSWORD) {
      setLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError("Email o password errate");
    }
  };

  // ✅ FORM CORREZIONI
  const [nome, setNome] = useState("");
  const [stato, setStato] = useState("");
  const [valore, setValore] = useState("");
  const [distretto, setDistretto] = useState("Distretto 1"); // default

  const sheetUrls: Record<string, string> = {
    "Distretto 1": "",
    "Distretto 2": "URL_APPS_SCRIPT_DISTRETTO2",
    "Distretto 3": "URL_APPS_SCRIPT_DISTRETTO3",
    "Distretto 4": "URL_APPS_SCRIPT_DISTRETTO4",
    "Distretto 13": "https://script.google.com/macros/s/AKfycbxzK5ddO1PPo5PAoK4OY7kEpC2bc7tHV7Cf01w6Tp8jdefDhtHtT2ooZ5iLYSqk5LF0/exec",
    // ... aggiungi gli altri come necessario
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("action", "correzione");
    formData.append("nome", nome);
    formData.append("stato", stato);
    formData.append("valore", valore);

    try {
      if (!sheetUrls[distretto]) {
        alert("URL del distretto non configurato!");
        return;
      }

      const response = await fetch(sheetUrls[distretto], {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const text = await response.text();

      if (text.startsWith("<!DOCTYPE html>")) {
        console.error("Risposta HTML ricevuta invece del testo:", text);
        alert("Errore: il server ha restituito HTML invece della risposta attesa.");
      } else {
        alert(text);
      }
    } catch (err) {
      console.error("Errore fetch:", err);
      alert("Errore durante la correzione. Controlla la console per dettagli.");
    }
  };

  // 🔹 SE NON LOGGATO → mostra login
  if (!loggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🔹 SE LOGGATO → mostra form correzioni
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Correzioni Presenze</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <div>
          <label className="block mb-1">Distretto</label>
          <select
            value={distretto}
            onChange={(e) => setDistretto(e.target.value)}
            className="w-full border rounded p-2"
          >
            {Object.keys(sheetUrls).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Stato</label>
          <select
            value={stato}
            onChange={(e) => setStato(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            <option value="">-- Seleziona --</option>
            <option value="Presenza">Presenza</option>
            <option value="Assenza">Assenza</option>
            <option value="Ferie">Ferie</option>
            <option value="Malattia">Malattia</option>
            <option value="Infortunio">Infortunio</option>
            <option value="Donazione sangue">Donazione sangue</option>
            <option value="Permesso sindacale">Permesso sindacale</option>
            <option value="Cassa integrazione">Cassa integrazione</option>
            <option value="Permessi Vari">Permessi Vari</option>
            <option value="Rientro">Rientro</option>
            <option value="Festivita">Festivita</option>
            <option value="Uscita">Uscita</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Nuovo valore</label>
          <input
            type="text"
            value={valore}
            onChange={(e) => setValore(e.target.value)}
            required
            placeholder="Es: 08.30 o PERMESSO RETRIBUITO"
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Applica Correzione
        </button>
      </form>
    </div>
  );
};

export default Correzioni;
