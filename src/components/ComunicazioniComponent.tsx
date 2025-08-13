// ComunicazioniComponent.tsx
"use client";
import { useState } from "react";

interface ComunicazioniProps {
  distretto: string;           // es. "distretto5"
  onClose: () => void;
  mode: "invia" | "stato" | "dl";
  nome?: string;               // opzionale: nome del caposquadra / persona (se lo sai)
}

const PROXY_URL = "/api/gas-proxy";

async function inviaGiustificativo(distrettoId: string, matricola: string, nome: string, testo: string) {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "invia", distretto: distrettoId, matricola, nome, testo }),
  });
  return res.json();
}

async function controllaStato(distrettoId: string, matricola: string) {
  const params = new URLSearchParams({ action: "stato", distretto: distrettoId, matricola });
  const res = await fetch(`${PROXY_URL}?${params.toString()}`);
  return res.json();
}

async function convalidaRichiesta(distrettoId: string, matricola: string, stato: string, commento?: string, password?: string) {
  const body: any = { action: "convalida", distretto: distrettoId, matricola, stato };
  if (commento) body.commento = commento;
  if (password) body.password = password;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

const ComunicazioniComponent = ({ distretto, onClose, mode, nome = "" }: ComunicazioniProps) => {
  const [matricola, setMatricola] = useState("");
  const [testo, setTesto] = useState("");
  const [feedback, setFeedback] = useState("");
  const [stato, setStato] = useState("");
  const [commento, setCommento] = useState("");
  const [statoDL, setStatoDL] = useState("");
  const [password, setPassword] = useState("");

  const handleInvio = async () => {
    if (!matricola.trim() || !testo.trim()) {
      setFeedback("Inserisci matricola e testo");
      return;
    }
    setFeedback("Invio in corso...");
    const result = await inviaGiustificativo(distretto, matricola.trim(), nome, testo.trim());
    if (result.status === "success") {
      setFeedback("Richiesta inviata! In attesa approvazione...");
      setMatricola("");
      setTesto("");
    } else {
      setFeedback("Errore: " + result.message);
    }
  };

  const handleControlla = async () => {
    if (!matricola.trim()) {
      setFeedback("Inserisci matricola");
      return;
    }
    setFeedback("Controllo in corso...");
    const result = await controllaStato(distretto, matricola.trim());
    if (result.status === "success") {
      setStato(result.stato);
      setFeedback(`Richiesta ${result.stato}${result.commento ? ": " + result.commento : ""}`);
    } else {
      setFeedback("Errore: " + result.message);
    }
  };

  const handleConvalida = async () => {
    if (!matricola.trim() || !statoDL) {
      alert("Inserisci matricola e seleziona stato");
      return;
    }
    if (!password) {
      alert("Inserisci password DL");
      return;
    }
    const result = await convalidaRichiesta(distretto, matricola.trim(), statoDL, commento, password);
    alert(result.message);
    if (result.status === "success") {
      setStato(statoDL);
      setFeedback(`Richiesta ${statoDL} con commento: ${commento}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Gestione Comunicazioni - {distretto}</h2>

      {/* Campo Matricola */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Matricola</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={matricola}
          onChange={(e) => setMatricola(e.target.value)}
        />
      </div>

      {mode === "invia" && (
        <>
          <label className="block mb-1 font-semibold">Testo Giustificativo</label>
          <textarea rows={5} className="border p-2 rounded w-full mb-4" value={testo} onChange={(e) => setTesto(e.target.value)} />
          <button onClick={handleInvio} className="bg-blue-600 text-white py-2 rounded w-full">Invia Richiesta</button>
        </>
      )}

      {mode === "stato" && (
        <>
          <button onClick={handleControlla} className="bg-gray-700 text-white py-2 rounded w-full">Controlla Stato</button>
          {stato && <p className="mt-4 font-semibold">Stato: <span>{stato}</span></p>}
        </>
      )}

      {mode === "dl" && (
        <>
          <label className="block mb-1 font-semibold">Esito</label>
          <select className="border p-2 rounded w-full mb-3" value={statoDL} onChange={(e) => setStatoDL(e.target.value)}>
            <option value="">Seleziona</option>
            <option value="Approvato">Approva</option>
            <option value="Rifiutato">Rifiuta</option>
          </select>

          <label className="block mb-1 font-semibold">Commento (opzionale)</label>
          <textarea rows={3} className="border p-2 rounded w-full mb-3" value={commento} onChange={(e) => setCommento(e.target.value)} />

          <label className="block mb-1 font-semibold">Password DL</label>
          <input type="password" className="border p-2 rounded w-full mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleConvalida} className="bg-green-600 text-white py-2 rounded w-full">Conferma</button>
        </>
      )}

      {feedback && <p className="mt-4 text-sm">{feedback}</p>}

      <button onClick={onClose} className="mt-6 underline text-sm text-gray-600 w-full">Chiudi</button>
    </div>
  );
};

export default ComunicazioniComponent;
