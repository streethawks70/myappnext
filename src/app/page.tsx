'use client';
import '../styles/global.css';
import { useState, useEffect } from 'react';
import DistrettoSelector from '../components/DistrettoSelector';
import SquadraSelector from '../components/SquadraSelector';
import MenuPresenza from '../components/MenuPresenza';

// Componente TabellaPresenze
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
  const [presenze, setPresenze] = useState<any[]>([]); // Lista delle presenze

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
          setPosizione(coords);
        },
        (err) => {
          console.warn('Errore posizione:', err);
        }
      );
    }

    // Reset giornaliero
    const currentDate = new Date().toISOString().split('T')[0]; // formato yyyy-mm-dd
    const lastSavedDate = localStorage.getItem('lastPresenzeDate'); // Controlla se è già stato salvato il giorno

    if (lastSavedDate !== currentDate) {
      setPresenze([]); // Reset della lista se è cambiato il giorno
      localStorage.setItem('lastPresenzeDate', currentDate); // Salva la nuova data
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verifica se il nome e il tipo di presenza sono già stati registrati
    const esisteGia = presenze.some(
      (presenza) => presenza.nome === selectedName && presenza.tipo === tipoPresenza
    );

    if (esisteGia) {
      alert('Questo nome è già stato registrato per questa presenza.');
      return; // Non aggiungere il nome se è già presente con lo stesso tipo
    }

    let permessoFinale = permesso;
    if (tipoPresenza === 'Permessi Vari') {
      const ora = new Date().toLocaleTimeString();
      permessoFinale += ` - ${ora}`;
    }

    const formData = new URLSearchParams();
    formData.append('nome', selectedName.trim());
    formData.append('stato', tipoPresenza);
    formData.append('targa', targa);
    formData.append('chilometri', chilometri);
    formData.append('dataInizio', dataInizio);
    formData.append('dataFine', dataFine);
    formData.append('tipoPermesso', permessoFinale);
    formData.append('posizione', posizione);

    // Aggiungi la nuova presenza
    const nuovaPresenza = {
      nome: selectedName,
      tipo: tipoPresenza,
      data: new Date().toLocaleDateString(),
    };

    setPresenze([...presenze, nuovaPresenza]);

    // Chiamata al backend per inviare i dati
    try {
      const sheetUrls: Record<string, string> = {
        'Distretto 1': 'https://script.google.com/macros/s/AKfycbxB6KtREvG7JhEHKZZ09PrBpswE6b-NRUh5BAflzf2T_gLJnJw1AeCREEQyA7k86xyquA/exec',
        'Distretto 2': 'URL_2',
        'Distretto 3': 'URL3',
        'Distretto 4': 'URL4',
        'Distretto 5': 'URL5',
        'Distretto 6': 'URL6',
        'Distretto 7': 'URL7',
        'Distretto 8': 'URL8',
        'Distretto 9': 'URL9',
        'Distretto 10': 'URL10',
        'Distretto 11': 'https://script.google.com/macros/s/AKfycbxivmpJtQJFt7zTpoolK_xkW8BRunCl9_tz3jOx99gBF2umvcB63tcmdgUaN118qdPK/exec',

        // Aggiungi gli altri distretti
      };

      const response = await fetch(sheetUrls[distretto], {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const text = await response.text();
      alert(text);
      resetForm();
    } catch (error) {
      console.error('Errore:', error);
      alert("Errore nell'invio dei dati.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 text-gray-800">
      <h1>Gestione Presenze</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <DistrettoSelector setDistretto={setDistretto} />

        {distretto && (
          <>
            <SquadraSelector
              distretto={distretto}
              setSelectedName={setSelectedName}
              selectedName={selectedName}
            />
            <MenuPresenza onSelect={setTipoPresenza} selected={tipoPresenza} />

            {selectedName && tipoPresenza && (
              <form onSubmit={handleSubmit}>
                {tipoPresenza === 'Presenza' && (
                  <>
                    <input
                      type="text"
                      placeholder="Targa"
                      value={targa}
                      onChange={(e) => setTarga(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Chilometri"
                      value={chilometri}
                      onChange={(e) => setChilometri(e.target.value)}
                      required
                    />
                  </>
                )}

                {(tipoPresenza === 'Ferie' || tipoPresenza === 'Malattia') && (
                  <>
                    <input
                      type="date"
                      value={dataInizio}
                      onChange={(e) => setDataInizio(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      value={dataFine}
                      onChange={(e) => setDataFine(e.target.value)}
                      required
                    />
                  </>
                )}

                {tipoPresenza === 'Permessi Vari' && (
                  <input
                    type="text"
                    placeholder="Tipo di permesso"
                    value={permesso}
                    onChange={(e) => setPermesso(e.target.value)}
                    required
                  />
                )}

                <button type="submit">Invia Dati</button>
              </form>
            )}
          </>
        )}

        {/* Tabella live delle presenze */}
        <TabellaPresenze presenze={presenze} />
      </div>
    </div>
  );
};

export default Home;
