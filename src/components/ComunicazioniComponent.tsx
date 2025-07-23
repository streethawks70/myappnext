'use client';
import { useEffect, useState } from 'react';

type ComunicazioniProps = {
  nome: string;
};

const PASSWORD_CORRETTA = '12345678';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqyi38Pe0LimJvpU1Cx0Djd8oRXzr60XGcjAeBZl_smUEitHPwqx1vcsuo_3B63ryq/exec';

const ComunicazioniComponent = ({ nome }: ComunicazioniProps) => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [matricola, setMatricola] = useState('');
  const [messaggiLetti, setMessaggiLetti] = useState<string[]>([]);
  const [notificaPresente, setNotificaPresente] = useState(false);

  // Nuovi stati per gestire visibilità form e messaggi
  const [showInvia, setShowInvia] = useState(true);
  const [showMessaggiLetti, setShowMessaggiLetti] = useState(false);

  useEffect(() => {
    const fetchMatricola = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getMatricola&nome=${encodeURIComponent(nome)}`);
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
  }, [nome]);

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
      const url = `${SCRIPT_URL}?action=invia&matricola=${encodeURIComponent(matricola)}&messaggio=${encodeURIComponent(messaggio)}`;
      const res = await fetch(url);
      const text = await res.text();
      alert(text);
      setMessaggio('');
      checkMessaggi(matricola);
    } catch (error) {
      console.error('Errore invio messaggio', error);
      alert('Errore invio messaggio');
    }
  };

  const checkMessaggi = async (mat: string) => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getMessaggi&matricola=${mat}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setNotificaPresente(true);
      } else {
        setNotificaPresente(false);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi', error);
      setNotificaPresente(false);
    }
  };

  const caricaMessaggi = async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getMessaggi&matricola=${matricola}`);
      const data = await res.json();
      setMessaggiLetti(Array.isArray(data) ? data : []);
      setNotificaPresente(false);
      setShowMessaggiLetti(true);
      setShowInvia(false); // Nascondi form invio messaggio quando carichi messaggi
    } catch (error) {
      console.error('Errore caricamento messaggi', error);
    }
  };

  const handleFine = () => {
    setMessaggiLetti([]);
    setShowMessaggiLetti(false);
    setShowInvia(false); // Nascondi anche form invio messaggio
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-2">Comunicazioni per {nome}</h2>

      {notificaPresente && (
        <div className="bg-yellow-200 text-yellow-800 font-semibold p-2 rounded mb-3">
          🔔 Hai un nuovo messaggio! Inserisci la password per leggerlo.
        </div>
      )}

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
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Accedi
          </button>
        </>
      ) : (
        <>
          {showInvia && (
            <div>
              <h3 className="mt-4">Invia Messaggio</h3>
              <textarea
                rows={4}
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Scrivi il messaggio qui..."
              />
              <button
                onClick={inviaMessaggio}
                className="bg-green-600 text-white py-2 px-4 rounded mb-4"
              >
                Invia Messaggio
              </button>
            </div>
          )}

          <hr className="my-4" />

          <h3>Messaggi Ricevuti</h3>
          {!showMessaggiLetti && (
            <button
              onClick={caricaMessaggi}
              className="bg-indigo-600 text-white py-2 px-4 rounded mb-2"
            >
              Carica Messaggi
            </button>
          )}

          {showMessaggiLetti && (
            <div>
              {messaggiLetti.length === 0 && <p>Nessun messaggio.</p>}
              {messaggiLetti.map((msg, i) => (
                <div key={i} className="border p-2 rounded mb-1 bg-yellow-100">
                  {msg}
                </div>
              ))}
              <button
                onClick={handleFine}
                className="bg-red-600 text-white py-2 px-4 rounded mt-4"
              >
                Fine
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComunicazioniComponent;
