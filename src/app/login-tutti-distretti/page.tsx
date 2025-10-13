"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginTuttiDistretti() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrore("Compila tutti i campi");
      return;
    }

    try {
      // Proviamo a fare una chiamata all'API Apps Script su un distretto qualsiasi per validare
      const res = await fetch(`/api/tutti-distretti?email=${email}&password=${password}`);
      const data = await res.json();

      if (data.error) {
        setErrore("Email o password non validi");
      } else {
        // Login riuscito → reindirizza alla mappa "tutti distretti"
        router.push(`/mappa-tutti-distretti?email=${email}&password=${password}`);
      }
    } catch (err) {
      setErrore("Errore server, riprova");
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Login Tutti Distretti</h1>
      <input
        className="w-full border p-2 mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2 mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full py-2 rounded mt-2"
      >
        Accedi
      </button>
      {errore && <p className="text-red-600 mt-4">{errore}</p>}
    </div>
  );
}
