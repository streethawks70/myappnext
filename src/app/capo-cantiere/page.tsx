'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuPresenza from '../../components/MenuPresenza';

const FIRMA_URL = 'https://script.google.com/macros/s/AKfycbzNrn2Ze2h1pSz5Kioybyl3U4irNJmasrqLfozErxo6SpCNIyPQahtiw9kfYEhXzC40/exec';

const DISTRETTO_URLS: { [key: string]: string } = {
  'Distretto 1': 'https://script.google.com/macros/s/AKfycbyZfVE8nYFQ_finiOyVc3WJagoPSQf8dtX0dsDhcYfVRiCjqhwNqM9krxpiMdGQIf5JZg/exec',
  'Distretto 2': 'https://script.google.com/macros/s/URL_SUD/exec',
  'Distretto 3': 'https://script.google.com/macros/s/AKfycbzsJok6SIe7JY9hP8z2DF66pGesdtqv1rFcmCJ3437w-WnRaaO5ebcWfbhnd_FynlVR/exec',
  'Distretto 4': 'https://script.google.com/macros/s/URL_OVEST/exec',
  'Distretto 5': 'https://script.google.com/macros/s/AKfycbyu_nl4bIkaybBunDavAJLmMZz6FJpNn3jB7fe7RyVY-Q_FSstc8eghxGW3qxE4cWBg/exec',
  'Distretto 6': 'https://script.google.com/macros/s/URL_6/exec',
  'Distretto 7': 'https://script.google.com/macros/s/URL_7/exec',
  'Distretto 8': 'https://script.google.com/macros/s/AKfycbxn8Usq4RmRPsoPUmnU8Qt3orrzwTWltjgYilCjRTEMjhYxbZekGftFrAyXDpzzmR0nHQ/exec',
  'Distretto 9': 'https://script.google.com/macros/s/AKfycbx2vPrIQNj8syqp49yNLg-almN4XGNYuiFI4mZOZUwA0yjS6iUEh83Gsi1aI1YOH6hI4g/exec',
  'Distretto 10': 'https://script.google.com/macros/s/AKfycbwm5i-hnm8a0-iez_Z23eFdIcT4KRweq9iLEQBNIV5cMq37bB5CEG3kiUX9wQD2Tzt2/exec',
  'Distretto 11': 'https://script.google.com/macros/s/AKfycbwlL6JsZHfO4z3okPOZTx5bTeZM0ZkU_7P8jl7vtSL0IALK-5_kHYUz__8JaMea7gYw/exec',
  'Distretto 13':'https://script.google.com/macros/s/AKfycbxBaTwDjP0VPOg2Z71HbEXUisCjCG_1S-9k1u3S5wGQ67L0PcWFwJwhDpKw_QhnPhHycA/exec'
};

export default function CapoCantierePage() {
  const [matricola, setMatricola] = useState('');
  const [nome, setNome] = useState('');
  const [tipoPresenza, setTipoPresenza] = useState('');
  const [posizione, setPosizione] = useState('');
  const [altitude, setAltitude] = useState('');
  const [permesso, setPermesso] = useState('');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const [targa, setTarga] = useState('');
  const [chilometri, setChilometri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviato, setInviato] = useState(false);
  const [firmaCompletata, setFirmaCompletata] = useState(false);
  const [squadre, setSquadre] = useState<string[]>([]);
  const [isVistoLoading, setIsVistoLoading] = useState(false);
  const [distretto, setDistretto] = useState('');

  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosizione(`${pos.coords.latitude},${pos.coords.longitude}`);
        setAltitude(pos.coords.altitude?.toFixed(2) ?? 'n.d.');
      },
      err => console.warn('Geoloc error', err),
      { enableHighAccuracy: true }
    );
  }, []);

  async function handleMatricola() {
    if (!matricola.trim()) {
      alert('Inserisci una matricola');
      return;
    }
    const res = await fetch('/capicantiere.txt');
    const righe = (await res.text()).split('\n').map(l => l.trim()).filter(Boolean);
    const match = righe.find(l => l.startsWith(matricola.trim() + '/'));
    if (!match) {
      alert('Matricola non trovata');
      setNome('');
      return;
    }
    setNome(match.split('/')[1].trim());
  }

  function getOra() {
    return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome) {
      alert('Verifica prima la matricola');
      return;
    }
    if (!tipoPresenza) {
      alert('Seleziona tipo presenza');
      return;
    }

    setIsLoading(true);
    try {
      const perm = tipoPresenza === 'Permessi Vari' ? `${permesso} - ${getOra()}` : '';
      const targaF = tipoPresenza === 'Presenza' ? `${targa} / ${chilometri} km / ${altitude} m` : `- / - km / ${altitude} m`;
      const fd = new URLSearchParams({
        nome,
        stato: tipoPresenza,
        targa: targaF,
        dataInizio,
        dataFine,
        tipoPermesso: perm,
        posizione
      });

      const res = await fetch(FIRMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString()
      });

      const text = await res.text();
      alert(`✅ ${text}`);
      setFirmaCompletata(true);
    } catch (err) {
      console.error(err);
      alert('❌ Errore invio dati');
    } finally {
      setIsLoading(false);
    }
  }

  async function caricaSquadre() {
    setIsVistoLoading(true);
    try {
      const res = await fetch('/capisquadra.txt');
      const righe = (await res.text()).split('\n').map(l => l.trim()).filter(Boolean);
      const riga = righe.find(l => l.startsWith(nome + ':'));
      if (!riga) {
        alert('Nessuna squadra trovata per questo capo');
        setSquadre([]);
        return;
      }
      const arr = riga.split(':')[1].split(',').map(s => s.trim());
      setSquadre(arr);
    } catch {
      alert('Errore caricamento squadre');
    } finally {
      setIsVistoLoading(false);
    }
  }

  async function handleVisto(sq: string) {
    if (!distretto || !DISTRETTO_URLS[distretto]) {
      alert('⚠️ Devi selezionare un distretto valido');
      return;
    }

    setIsVistoLoading(true);

    const raw = sq.trim().split(' ').pop()!;
    const squadra = raw.toUpperCase().startsWith('SQUADRA') ? raw.toUpperCase() : `SQUADRA${raw}`;

    const fd = new URLSearchParams({
      squadra,
      posizione,
      nome
    });

    try {
      const res = await fetch(DISTRETTO_URLS[distretto], {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd.toString(),
      });

      const msg = await res.text();
      alert(`✔️ ${msg}`);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('❌ Errore invio visto');
    } finally {
      setIsVistoLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Titolo con emoji */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        👷‍♂️🛠️ Capo Cantiere
      </h1>
      {!firmaCompletata && !inviato ? (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Inserisci Matricola</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={matricola}
                onChange={e => setMatricola(e.target.value)}
                placeholder="12345"
                className="border p-2 flex-1 rounded"
              />
              <button onClick={handleMatricola} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">
                Verifica
              </button>
            </div>
          </div>

          {nome && (
            <>
              <p className="mb-2 text-green-700 font-semibold">
                ✅ Trovato: <strong>{nome}</strong>
              </p>

              <button
                onClick={async () => {
                  setFirmaCompletata(true);
                }}
                className="mb-4 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                ➕ Solo Visto (firma già effettuata)
              </button>

              <MenuPresenza selected={tipoPresenza} onSelect={setTipoPresenza} />

              {tipoPresenza && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {tipoPresenza === 'Presenza' && (
                    <>
                      <input
                        type="text"
                        value={targa}
                        onChange={e => setTarga(e.target.value)}
                        placeholder="Targa veicolo"
                        required
                        className="border p-2 rounded"
                      />
                      <input
                        type="number"
                        value={chilometri}
                        onChange={e => setChilometri(e.target.value)}
                        placeholder="Chilometri"
                        required
                        className="border p-2 rounded"
                      />
                    </>
                  )}

                  {['Ferie', 'Malattia'].includes(tipoPresenza) && (
                    <>
                      <input
                        type="date"
                        value={dataInizio}
                        onChange={e => setDataInizio(e.target.value)}
                        required
                        className="border p-2 rounded"
                      />
                      <input
                        type="date"
                        value={dataFine}
                        onChange={e => setDataFine(e.target.value)}
                        required
                        className="border p-2 rounded"
                      />
                    </>
                  )}

                  {tipoPresenza === 'Permessi Vari' && (
                    <select
                      value={permesso}
                      onChange={e => setPermesso(e.target.value)}
                      required
                      className="border p-2 rounded"
                    >
                      <option value="" disabled>
                        -- Seleziona permesso --
                      </option>
                      <option>PERMESSO RETRIBUITO</option>
                      <option>LEGGE 104</option>
                      <option>ART.9</option>
                      <option>PERMESSO BANCA</option>
                      <option>VISITA MEDICA</option>
                      <option>PERMESSO LUTTO</option>
                      <option>ART 51</option>
                      <option>ATTIVABILE</option>
                      <option>LAVORI DISAGIATI</option>
                    </select>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    {isLoading ? 'Invio...' : 'Invia Presenza'}
                  </button>
                </form>
              )}
            </>
          )}
        </>
      ) : firmaCompletata && !inviato ? (
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">✅ Firma completata</h3>
          <p className="text-gray-600">Vuoi procedere all'invio del visto alle squadre?</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={async () => {
                await caricaSquadre();
                setInviato(true);
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              ✅ Invia Visto
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
            >
              🔙 Torna alla Home
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="mb-4 text-xl font-semibold">Seleziona Distretto</h3>
          <select
            value={distretto}
            onChange={e => setDistretto(e.target.value)}
            className="mb-4 border p-2 rounded w-full"
          >
            <option value="">-- Scegli un distretto --</option>
            {Object.keys(DISTRETTO_URLS).map(nome => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </select>

          {distretto ? (
            <>
              <h4 className="mb-2 text-lg font-semibold">Visto Squadra</h4>
              {squadre.length > 0 ? (
                squadre.map(sq => (
                  <button
                    key={sq}
                    onClick={() => handleVisto(sq)}
                    disabled={isVistoLoading}
                    className="block bg-blue-600 text-white py-2 mb-2 rounded w-full hover:bg-blue-700"
                  >
                    {sq}
                  </button>
                ))
              ) : (
                <p>Nessuna squadra disponibile</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">⚠️ Seleziona prima un distretto</p>
          )}
        </div>
      )}
    </div>
  );
}
