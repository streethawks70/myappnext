'use client';
import '../styles/global.css';
import { useState, useEffect } from 'react';
import Link from 'next/link'; // ⬅️ IMPORT NECESSARIO
import DistrettoSelector from '../components/DistrettoSelector';
import SquadraSelector from '../components/SquadraSelector';
import MenuPresenza from '../components/MenuPresenza';
import Testiamo from '../components/Testiamo';
import { Edit } from "lucide-react";



const TabellaPresenze = ({ presenze }: { presenze: any[] }) => {
  return (
    <div className="mt-6">
      <h3>Presenze del Giorno</h3>
      <table className="table-auto border-collapse w-full text-left">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nome</th>
            <th className="border px-4 py-2">Tipo di Presenza</th>
            <th className="border px-4 py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {presenze.map((presenza, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{presenza.nome}</td>
              <td className="border px-4 py-2">{presenza.tipo}</td>
              <td className="border px-4 py-2">{presenza.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
     
    
  );
};

const Home = () => {
  const [distretto, setDistretto] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [tipoPresenza, setTipoPresenza] = useState('');
  const [targa, setTarga] = useState('');
  const [chilometri, setChilometri] = useState('');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  const [permesso, setPermesso] = useState('');
  const [posizione, setPosizione] = useState('');
  const [altitude, setAltitude] = useState('');
  const [presenze, setPresenze] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, altitude } = pos.coords;
          const coords = `${latitude},${longitude}`;
          setPosizione(coords);
  
          if (altitude !== null) {
            setAltitude(altitude.toFixed(2));
          } else {
            // Fallback: chiamata all'API Open Elevation
            fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`)
              .then(res => res.json())
              .then(data => {
                const elevation = data.results?.[0]?.elevation;
                if (elevation !== undefined) {
                  setAltitude(elevation.toFixed(2));
                } else {
                  setAltitude('n.d.');
                }
              })
              .catch(() => {
                setAltitude('n.d.');
              });
          }
        },
        (err) => {
          console.warn('Errore posizione:', err);
        },
        { enableHighAccuracy: true }
      );
    }
  
    const currentDate = new Date().toISOString().split('T')[0];
    const lastSavedDate = localStorage.getItem('lastPresenzeDate');
  
    if (lastSavedDate !== currentDate) {
      setPresenze([]);
      localStorage.setItem('lastPresenzeDate', currentDate);
      localStorage.removeItem('statiPresenze');
    }
  }, []);
  
  
  
  const resetForm = () => {
    setTipoPresenza('');
    setTarga('');
    setChilometri('');
    setDataInizio('');
    setDataFine('');
    setPermesso('');
    setSelectedName('');
  };

  const getOraFormattata = () => {
    const now = new Date();
    const ore = now.getHours().toString().padStart(2, '0');
    const minuti = now.getMinutes().toString().padStart(2, '0');
    return `${ore}.${minuti}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // 1️⃣ Recupera gli stati salvati
  const statiSalvati = JSON.parse(localStorage.getItem('statiPresenze') || '{}');
  const statoPrecedente = statiSalvati[selectedName];

  // 2️⃣ Controlli logici di coerenza
  const erroreLogico =
    (statoPrecedente === 'Presenza' && ['Ferie', 'Malattia', 'Infortunio', 'Assenza'].includes(tipoPresenza)) ||
    (['Ferie', 'Malattia', 'Permessi Vari', 'Donazione sangue', 'Cassa integrazione'].includes(statoPrecedente) && tipoPresenza === 'Uscita');

  if (erroreLogico) {
    alert(`❌ Operazione non consentita.\n\nDopo "${statoPrecedente}" non puoi inserire "${tipoPresenza}" per ${selectedName}.`);
    setIsLoading(false);
    return;
  }

    let permessoFinale = permesso;
    if (tipoPresenza === 'Permessi Vari') {
      const ora = getOraFormattata();
      permessoFinale += ` - ${ora}`;
    }

    const formData = new URLSearchParams();
    formData.append('nome', selectedName.trim());
    formData.append('stato', tipoPresenza);
    formData.append('targa', `${targa} / ${chilometri} km / ${altitude} m`);
    formData.append('dataInizio', dataInizio);
    formData.append('dataFine', dataFine);
    formData.append('tipoPermesso', permessoFinale);
    formData.append('posizione', posizione);

    try {
      const sheetUrls: Record<string, string> = {
        'Distretto 1': 'https://script.google.com/macros/s/AKfycbyZfVE8nYFQ_finiOyVc3WJagoPSQf8dtX0dsDhcYfVRiCjqhwNqM9krxpiMdGQIf5JZg/exec',
        'Distretto 2': 'https://script.google.com/macros/s/AKfycbypH8yFYfN8anr5S_cswx1nl9Nutp6vjIPV-CSiYlTzuA6j5hOqZlcjHxcpOez_ss8M5A/exec',
        'Distretto 3': 'https://script.google.com/macros/s/AKfycbzsJok6SIe7JY9hP8z2DF66pGesdtqv1rFcmCJ3437w-WnRaaO5ebcWfbhnd_FynlVR/exec',
        'Distretto 4': 'https://script.google.com/macros/s/AKfycbzz_Zm8ezcdA0TkgaNt4OLVvMseC4TD8-mi0ExVgcmGsk9L70XFRcMcJ6zMS6dXnWj7AQ/exec',
        'Distretto 5': 'https://script.google.com/macros/s/AKfycbyu_nl4bIkaybBunDavAJLmMZz6FJpNn3jB7fe7RyVY-Q_FSstc8eghxGW3qxE4cWBg/exec',
        'Distretto 6': 'https://script.google.com/macros/s/AKfycbxcxQ5WqcsD_UmARccxuglj7kfs1OMgrU1k14pCiMvRMIJGTy21sujR806wHmPKwBEtAA/exec',
        'Distretto 7': 'URL7',
        'Distretto 8': 'https://script.google.com/macros/s/AKfycbxn8Usq4RmRPsoPUmnU8Qt3orrzwTWltjgYilCjRTEMjhYxbZekGftFrAyXDpzzmR0nHQ/exec',
        'Distretto 9': 'https://script.google.com/macros/s/AKfycbzLL0VM0DtGTVRIpYQGcoX3VSuBHOKX0iaoul199WnX56m_mBhEgS1H8JXiPU_61OKkHA/exec',
        'Distretto 10': 'https://script.google.com/macros/s/AKfycbyOHZ6oHE-SJAZLPdgSyio1Zfm2iG1nEkdeDPGH9Rhofw8FUX666ax49R6Pf28y_ig/exec',
        'Distretto 11': 'https://script.google.com/macros/s/AKfycbwlL6JsZHfO4z3okPOZTx5bTeZM0ZkU_7P8jl7vtSL0IALK-5_kHYUz__8JaMea7gYw/exec',
        'Distretto 12':  'https://script.google.com/macros/s/AKfycby3fuDsAYPQI5ulosjgDF2v360_FxGeKqzEkax8Yp-MwCrLoZ2qKTzdcaekE4Kb3hO0/exec',
        'Distretto 13': 'https://script.google.com/macros/s/AKfycbxzK5ddO1PPo5PAoK4OY7kEpC2bc7tHV7Cf01w6Tp8jdefDhtHtT2ooZ5iLYSqk5LF0/exec',

      };

      const response = await fetch(sheetUrls[distretto], {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await response.text();
      alert(text);
      
    // 5️⃣ Salva stato aggiornato nel localStorage
    statiSalvati[selectedName] = tipoPresenza;
    localStorage.setItem('statiPresenze', JSON.stringify(statiSalvati));

      const nuovaPresenza = {
        nome: selectedName,
        tipo: tipoPresenza,
        data: new Date().toLocaleDateString(),
      };

      setPresenze((prev) => [...prev, nuovaPresenza]);
      resetForm();
    } catch (error) {
      console.error('Errore:', error);
      alert("Errore nell'invio dei dati.");
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
   // <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 text-gray-800">
   //   {/* ✅ BOTTONE RESOCONTO */}
   //   <div className="w-full max-w-xl mb-4 flex justify-end">
    //    <Link href="/resoconto">
     //     <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
     //       Vai al Resoconto
      //    </button>
      //  </Link>
      //</div>
     
      <div className="min-h-screen bg-green-50 flex flex-col items-center p-4 text-gray-800">

      <h1 className="text-2xl font-bold mb-4">Gestione Presenze</h1>
      <h2 className='text-2xl font-bold mb-4'> Azienda</h2>
      <h1 className='text-5xl font-bold mb-4'>Calabria Verde</h1>

<div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
  <Link href="/ddl">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      Accesso Direttori dei Lavori
    </button>
  </Link>

  <Link href="/accesso/login">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      Accesso Dashboard
    </button>
  </Link>

  <Link href="/Notifica">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      Richiesta Giustificativi
    </button>
  </Link>

  <Link href="/Storico">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      STORICO MENSILITA'
    </button>
  </Link>

  <Link href="/admin">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      Comunicazioni
    </button>
  </Link>

  {/* sesto pulsante (es. altro/settimo se ne hai uno) */}
  <Link href="/altro">
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition w-48">
      Altro
    </button>
  </Link>

  {/* Settimo bottone: Vai a Correzioni -> su tutta la riga, centrato */}
  <div className="col-span-1 sm:col-span-2 flex justify-center">
    <Link
      href="/Correzioni"
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
    >
      <Edit className="w-4 h-4" />
      Vai a Correzioni
    </Link>
  </div>
</div>


      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <DistrettoSelector setDistretto={setDistretto} />

        {distretto && (
          <>
            <SquadraSelector
              distretto={distretto}
              selectedName={selectedName}
              setSelectedName={setSelectedName}
            />
            <MenuPresenza selected={tipoPresenza} onSelect={setTipoPresenza} />

            {selectedName && tipoPresenza && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                {tipoPresenza === 'Presenza' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Targa</label>
                      <input
                        type="text"
                        placeholder="AB123CD"
                        value={targa}
                        onChange={(e) => setTarga(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Chilometri</label>
                      <input
                        type="number"
                        placeholder="20450"
                        value={chilometri}
                        onChange={(e) => setChilometri(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Quota (m)</label>
                      <input
                        type="text"
                        placeholder="Quota"
                        value={altitude}
                        readOnly
                        className="w-full border rounded p-2 bg-gray-100"
                      />
                    </div>
                  </div>
                )}

                {(tipoPresenza === 'Ferie' || tipoPresenza === 'Malattia') && (
                  <>
                    <input
                      type="date"
                      value={dataInizio}
                      onChange={(e) => setDataInizio(e.target.value)}
                      required
                      className="border rounded p-2"
                    />
                    <input
                      type="date"
                      value={dataFine}
                      onChange={(e) => setDataFine(e.target.value)}
                      required
                      className="border rounded p-2"
                    />
                  </>
                )}

{tipoPresenza === 'Permessi Vari' && (
  <div className="flex flex-col gap-3">
    <div>
      <label className="block text-sm font-medium mb-1">Seleziona Tipo di Permesso</label>
      <select
        value={permesso}
        onChange={(e) => setPermesso(e.target.value)}
        required
        className="border rounded p-2 w-full"
      >
        <option value="" disabled>-- Seleziona un permesso --</option>
        <option value="PERMESSO RETRIBUITO">PERMESSO RETRIBUITO</option>
        <option value="LEGGE 104">LEGGE 104</option>
        <option value="ART.9">ART.9</option>
        <option value="DISTACCAMENTO AIB">DISTACCAMENTO AIB</option>
        <option value="DISTACCAMENTO CONVENZIONE">DISTACCAMENTO-CONVENZIONE</option>
        <option value="PERMESSO LUTTO">PERMESSO LUTTO</option>
        <option value="VISITA MEDICA">VISITA MEDICA</option>
        <option value="PERMESSO ELETTORALE">PERMESSO ELETTORALE</option>
        <option value="ART 51">ART 51</option>
        <option value="PERMESSO CAUSA PIOGGIA">PERMESSO CAUSA PIOGGIA</option>
        <option value="ATTIVABILE">ATTIVABILE</option>
        <option value="ASPETTATIVA ">ASPETTATIVA</option>
        <option value="LAVORI DISAGIATI ">LAVORI DISAGIATI</option>
        <option value="CONGEDO PARENTALE">CONGEDO PARENTALE</option>
        <option value="RIPOSO VEDETTE">RIPOSO VEDETTE</option>
      </select>
    </div>

    {/* ✅ Se il permesso è DISTACCAMENTO AIB mostro il calendario */}
    {permesso === 'DISTACCAMENTO AIB' && (
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Data Inizio</label>
          <input
            type="date"
            value={dataInizio}
            onChange={(e) => setDataInizio(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Data Fine</label>
          <input
            type="date"
            value={dataFine}
            onChange={(e) => setDataFine(e.target.value)}
            required
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
    )}
  </div>
)}


                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  {isLoading ? 'Invio...' : 'Invia Dati'}
                </button>
              </form>
            )}
          





          </>
        )}

        <TabellaPresenze presenze={presenze} />
        
      </div>
    </div>
    
  );
};

export default Home;
