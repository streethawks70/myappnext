import { useEffect, useState } from 'react';

interface Squadra {
  matricola: string;
  nome: string;
  operai: string[];
}

const SquadraSelector = ({
  distretto,
  setSelectedName,
  selectedName
}: {
  distretto: string;
  setSelectedName: (name: string) => void;
  selectedName: string;
}) => {
  const [squadre, setSquadre] = useState<Squadra[]>([]);
  const [matricolaInput, setMatricolaInput] = useState('');
  const [squadraTrovata, setSquadraTrovata] = useState<Squadra | null>(null);
  const [valore, setValore] = useState("");

  useEffect(() => {
    if (!distretto) return;
    const fileName = `/distretto${distretto.match(/\d+/)?.[0]}.txt`;
    fetch(fileName)
      .then((res) => res.text())
      .then((data) => {
        const righe = data.split('\n').filter(line => line.trim() !== '');
        const parsed = righe.map(riga => {
          const [matricolaParte, squadraParte] = riga.split('squadra');
          const matricola = matricolaParte.trim().replace('matricola', '').trim();
          const parts = squadraParte.split('/').filter(p => p.trim() !== '');
          const nomeCapoSquadra = parts[1].trim();
          const operai = parts.slice(2).map(op => op.trim());
          return { matricola, nome: nomeCapoSquadra, operai };
        });
        setSquadre(parsed);
      });
  }, [distretto]);

  const handleMatricolaSubmit = () => {
    const squadra = squadre.find(s => s.matricola === matricolaInput.trim());
    if (squadra) {
      setSquadraTrovata(squadra);
      setSelectedName(squadra.nome); // Preseleziona il caposquadra
    } else {
      alert('Matricola non trovata nel distretto selezionato.');
      setSquadraTrovata(null);
      setSelectedName('');
    }
  };

  const handlePersonaSelect = (persona: string) => {
    setSelectedName(persona);
  };

  return (
    <div className="form-group">
      <h3>Inserisci Matricola Caposquadra</h3>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder ="Inserisci matricola"
          value={matricolaInput}
          onChange={(e) => setMatricolaInput(e.target.value)}
           className="placeholder-red-500 border border-gray-300 p-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700"type="button" onClick={handleMatricolaSubmit}>
          Verifica
        </button>
      </div>

      {squadraTrovata && (
  <div className="radio-group mt-4">
    <p>Seleziona Persona:</p>

    {/* Caposquadra (primo della lista) */}
    <label className="flex items-center gap-2">
      <input
        type="radio"
        checked={selectedName === squadraTrovata.nome}
        onChange={() => handlePersonaSelect(squadraTrovata.nome)}
      />
      👷‍♂️ {squadraTrovata.nome} <span className="text-sm text-gray-500">(Caposquadra)</span>
    </label>

    {/* Operai */}
    {squadraTrovata.operai.map((operaio, i) => (
      <label key={i} className="flex items-center gap-2">
        <input
          type="radio"
          checked={selectedName === operaio}
          onChange={() => handlePersonaSelect(operaio)}
        />
        👷 {operaio}
        
      </label>
      
    ))}
  </div>
)}


    </div>
  );
};

export default SquadraSelector;
