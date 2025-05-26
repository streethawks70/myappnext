'use client';
import { useState } from 'react';
import Link from 'next/link';

const distretti = [
  {
    nome: 'Distretto 12',
    url: 'https://script.google.com/macros/s/AKfycbx-jKsTOvjnpo3UGXPkfAqtJlJG7krXUXWx6sNeMOoQOWfPuFoQSxpwV3hLD9wvvUbQ/exec'
  },
];

function arrayToCSV(data: any[]) {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(fieldName => `"${(row[fieldName] || '').toString().replace(/"/g, '""')}"`)
        .join(',')
    )
  ];
  return csvRows.join('\n');
}

const formatOra = (val: string) => {
  try {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return val;
  }
};

const Resoconto = () => {
  const [nome, setNome] = useState('');
  const [distretto, setDistretto] = useState(distretti[0].url);
  const [dati, setDati] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const handleCerca = async () => {
    setLoading(true);
    setErrore('');
    setDati([]);
    try {
      const res = await fetch(`${distretto}?action=leggi&nome=${encodeURIComponent(nome)}`);

      const json = await res.json();
      if (json.success && json.dati?.length > 0) {
        setDati(json.dati);
      } else {
        setErrore('Nessun dato trovato.');
      }
    } catch {
      setErrore('Errore nella richiesta.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csv = arrayToCSV(dati);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resoconto_presenze.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 text-gray-800">
      <div className="w-full max-w-xl mb-4 flex justify-end">
        <Link href="/">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
            Vai a PRESENZE
          </button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Resoconto Presenze</h1>

      <div className="bg-white p-4 rounded shadow-md max-w-lg w-full mb-4">
        <label className="block mb-2 text-sm font-medium">Nome o Cognome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          placeholder="Mario Rossi"
        />

        <label className="block mb-2 text-sm font-medium">Seleziona Distretto</label>
        <select
          value={distretto}
          onChange={(e) => setDistretto(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          {distretti.map((d, i) => (
            <option key={i} value={d.url}>{d.nome}</option>
          ))}
        </select>

        <button
          onClick={handleCerca}
          disabled={loading || !nome.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          {loading ? 'Caricamento...' : 'Cerca'}
        </button>
      </div>

      {errore && <p className="text-red-500 text-center">{errore}</p>}

      {dati.length > 0 && (
        <div className="bg-white p-4 rounded shadow-md overflow-x-auto max-w-full mx-auto mt-6">
          <h2 className="text-lg font-bold mb-2">Risultati trovati:</h2>
          <table className="w-full table-auto text-sm border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Foglio</th>
                <th className="border px-2 py-1">Data</th>
                <th className="border px-2 py-1">Nome</th>
                <th className="border px-2 py-1">Matricola</th>
                <th className="border px-2 py-1">Presenza</th>
                <th className="border px-2 py-1">Assenza</th>
                <th className="border px-2 py-1">Ferie</th>
                <th className="border px-2 py-1">Malattia</th>
                <th className="border px-2 py-1">Infortunio</th>
                <th className="border px-2 py-1">Donazione</th>
                <th className="border px-2 py-1">Sindacale</th>
                <th className="border px-2 py-1">CIGS</th>
                <th className="border px-2 py-1">Permessi Vari</th>
                <th className="border px-2 py-1">Rientro</th>
                <th className="border px-2 py-1">Festività</th>
                <th className="border px-2 py-1">Uscita</th>
              </tr>
            </thead>
            <tbody>
              {dati.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{item.foglio}</td>
                  <td className="border px-2 py-1">{item['Data']}</td>
                  <td className="border px-2 py-1">{item['Nome']}</td>
                  <td className="border px-2 py-1">{item['Matricola']}</td>
                  <td className="border px-2 py-1">{formatOra(item['Presenza'])}</td>
                  <td className="border px-2 py-1">{item['Assenza']}</td>
                  <td className="border px-2 py-1">{item['Ferie']}</td>
                  <td className="border px-2 py-1">{item['Malattia']}</td>
                  <td className="border px-2 py-1">{item['Infortunio']}</td>
                  <td className="border px-2 py-1">{item['Donazione']}</td>
                  <td className="border px-2 py-1">{item['Sindacale']}</td>
                  <td className="border px-2 py-1">{item['CIGS']}</td>
                  <td className="border px-2 py-1">{item['Permessi Vari']}</td>
                  <td className="border px-2 py-1">{formatOra(item['Rientro'])}</td>
                  <td className="border px-2 py-1">{item['Festività']}</td>
                  <td className="border px-2 py-1">{formatOra(item['Uscita'])}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleDownloadCSV}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Scarica CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default Resoconto;
