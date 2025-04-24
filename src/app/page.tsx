'use client';
import { useState, useEffect } from 'react';
import DistrettoSelector from '../components/DistrettoSelector';
import SquadraSelector from '../components/SquadraSelector';
import MenuPresenza from '../components/MenuPresenza';

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

    const sheetUrls: Record<string, string> = {
      'Distretto 1': 'https://script.google.com/macros/s/AKfycbxB6KtREvG7JhEHKZZ09PrBpswE6b-NRUh5BAflzf2T_gLJnJw1AeCREEQyA7k86xyquA/exec',
      'Distretto 2': 'URL_2',
      'Distretto 3': 'URL_3',
      'Distretto 4': 'https://script.google.com/macros/s/AKfycbxivmpJtQJFt7zTpoolK_xkW8BRunCl9_tz3jOx99gBF2umvcB63tcmdgUaN118qdPK/exec',
      'Distretto 5': 'URL_5',
      'Distretto 6': 'URL_6',
      'Distretto 7': 'URL_7',
      'Distretto 8': 'URL_8',
      'Distretto 9': 'URL_9',
      'Distretto 10': 'URL_10',
      'Distretto 11': 'URL_11',
    };

    try {
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
      alert('Errore nell\'invio dei dati.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Gestione Presenze</h1>
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
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
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

              <button type="submit" style={{ marginTop: '10px' }}>
                Invia Dati
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
