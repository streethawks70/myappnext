'use client';
import { useEffect, useState } from 'react';

interface ComunicazioniProps {
  distretto: string;
  nome?: string;
  onClose: () => void; // 👈 nuova prop per chiudere il componente
}

type MessaggioSquadra = {
  nome: string;
  matricola: string;
  messaggio: string;
};

const scriptUrl = 'https://script.google.com/macros/s/AKfycbyYp39XkdvzkNBlVE0PlK8h20cD5dtUZ8Ofjkb6MHQ7hE1MjS5njD_KyyI-xsl9D2B1/exec';
const PASSWORD_CORRETTA = '12345678';

const ComunicazioniComponent = ({ nome, distretto, onClose }: ComunicazioniProps) => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [matricola, setMatricola] = useState('');
  const [messaggioRicevuto, setMessaggioRicevuto] = useState('');
  const [messaggioEsistente, setMessaggioEsistente] = useState(false);
  const [showMessaggioManuale, setShowMessaggioManuale] = useState(false);
  const [messaggiSquadra, setMessaggiSquadra] = useState<MessaggioSquadra[]>([]);

  useEffect(() => {
    if (nome) {
      const fetchMatricola = async () => {
        try {
          const res = await fetch(`${scriptUrl}?action=getMatricola&nome=${encodeURIComponent(nome)}&distretto=${encodeURIComponent(distretto)}`);
          const data = await res.json();
          if (data.matricola) {
            setMatricola(data.matricola);
            checkMessaggi(data.matricola);
          }
        } catch (error) {
          console.error('Errore nel recupero della matricola', error);
        }
      };
      fetchMatricola();
    } else {
      leggiMessaggiSquadra();
    }
  }, [nome, distretto]);

  const checkMessaggi = async (mat: string) => {
    try {
      const res = await fetch(`${scriptUrl}?action=getMessaggi&matricola=${mat}&distretto=${encodeURIComponent(distretto)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMessaggioRicevuto(data[0]);
        setMessaggioEsistente(true);
      } else {
        setMessaggioRicevuto('');
        setMessaggioEsistente(false);
      }
    } catch (error) {
      console.error('Errore nel controllo messaggi', error);
    }
  };

  const leggiMessaggiSquadra = async () => {
    try {
      const res = await fetch(`${scriptUrl}?action=getMessaggiSquadra&distretto=${encodeURIComponent(distretto)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessaggiSquadra(data);
        setShowMessaggioManuale(true);
      }
    } catch (error) {
      console.error('Errore recupero messaggi squadra', error);
    }
  };

  const handleLogin = () => {
    if (password === PASSWORD_CORRETTA) {
      setIsLoggedIn(true);
      setPassword('');
      alert('Accesso consentito');
    } else {
      alert('Password errata');
    }
  };

  const inviaMessaggio = async () => {
    if (!messaggio.trim()) {
      alert('Inserisci un messaggio');
      return;
    }
  
    try {
      const url = `${scriptUrl}?action=invia&matricola=${encodeURIComponent(matricola)}&messaggio=${encodeURIComponent(messaggio)}&distretto=${encodeURIComponent(distretto)}`;
      const res = await fetch(url);
      const text = await res.text();
      alert(text);
      setMessaggio('');
      checkMessaggi(matricola);
  
      if (text === 'Messaggio inviato correttamente') {
        onClose(); // ✅ Chiude il form dopo invio
      }
  
    } catch (error) {
      console.error('Errore invio messaggio', error);
      alert('Errore invio messaggio');
    }
  };
  

  const eliminaMessaggio = async () => {
    try {
      const res = await fetch(`${scriptUrl}?action=cancellaMessaggio&matricola=${encodeURIComponent(matricola)}&distretto=${encodeURIComponent(distretto)}`);
      const text = await res.text();
      alert(text);

      // Reset stati locali
      setMessaggio('');
      setMessaggioRicevuto('');
      setMessaggioEsistente(false);
      setShowMessaggioManuale(false);

      // Chiudi il form
      onClose(); // 👈 torna alla schermata iniziale
    } catch (error) {
      console.error('Errore eliminazione messaggio', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-2">
        Comunicazioni {nome ? `per ${nome}` : `per la squadra ${distretto}`}
      </h2>

      {!isLoggedIn ? (
        <>
          <h3>Login Comunicazioni</h3>
          <input
            type="password"
            placeholder="Inserisci password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-2"
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleLogin} className="bg-blue-600 text-white py-2 px-4 rounded">
              Accedi
            </button>
            {nome && (
              <button
                onClick={() => {
                  checkMessaggi(matricola);
                  setShowMessaggioManuale(true);
                }}
                className="bg-yellow-500 text-white py-2 px-4 rounded"
              >
                📩 Leggi Messaggio
              </button>
            )}
            <button onClick={leggiMessaggiSquadra} className="bg-purple-600 text-white py-2 px-4 rounded">
              🧑‍🤝‍🧑 Messaggi Squadra
            </button>
          </div>
        </>
      ) : null}

      {(messaggioEsistente || showMessaggioManuale) && messaggioRicevuto && (
        <div className="bg-yellow-200 p-3 rounded mt-4">
          <p className="font-semibold">📢 Messaggio ricevuto per {nome},{matricola}:</p>
          <p className="mt-2">{messaggioRicevuto}</p>
          <button onClick={eliminaMessaggio} className="bg-red-600 text-white py-1 px-3 rounded mt-3">
            Elimina Messaggio
          </button>
        </div>
      )}

      {messaggiSquadra.length > 0 && (
        <div className="bg-gray-100 p-3 rounded mt-4">
          <h3 className="font-semibold mb-2">📢 Messaggi dalla Squadra</h3>
          <ul className="list-disc ml-4">
            {messaggiSquadra.map((m, i) => (
              <li key={i}>
                <strong>{m.nome}</strong>: {m.messaggio}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoggedIn && nome && !messaggioEsistente && (
        <div>
          <h3 className="mt-4 font-semibold">Invia Messaggio</h3>
          <textarea
            rows={4}
            value={messaggio}
            onChange={(e) => setMessaggio(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            placeholder="Scrivi il messaggio qui..."
          />
          <button
            onClick={inviaMessaggio}
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            Invia Messaggio
          </button>
        </div>
      )}
    </div>
  );
};

export default ComunicazioniComponent;
