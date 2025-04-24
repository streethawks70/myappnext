import { useEffect, useState } from 'react';

interface Squadra {
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
  const [capoSquadra, setCapoSquadra] = useState('');

  useEffect(() => {
    const fileName = `/distretto${distretto.match(/\d+/)?.[0]}.txt`;
    fetch(fileName)
      .then((res) => res.text())
      .then((data) => {
        const righe = data.split('\n').filter(line => line.trim() !== '');
        const parsed = righe.map(riga => {
          const parts = riga.split('/');
          return { nome: parts[0].trim(), operai: parts.slice(1).map(op => op.trim()) };
        });
        setSquadre(parsed);
      });
  }, [distretto]);

  const handleCapoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCapoSquadra(e.target.value);
    setSelectedName(e.target.value);
  };

  const handlePersonaSelect = (persona: string) => {
    setSelectedName(persona);
  };

  return (
    <div>
      <h3>Seleziona Squadra</h3>
      <select onChange={handleCapoChange} value={capoSquadra}>
        <option value="">-- Seleziona Caposquadra --</option>
        {squadre.map((s, i) => (
          <option key={i} value={s.nome}>{s.nome}</option>
        ))}
      </select>

      {capoSquadra && (
        <>
          <p>Seleziona Persona:</p>
          <label>
            <input
              type="radio"
              checked={selectedName === capoSquadra}
              onChange={() => handlePersonaSelect(capoSquadra)}
            />
            {capoSquadra} (Caposquadra)
          </label>
          {squadre.find(s => s.nome === capoSquadra)?.operai.map((op, i) => (
            <div key={i}>
              <label>
                <input
                  type="radio"
                  checked={selectedName === op}
                  onChange={() => handlePersonaSelect(op)}
                />
                {op}
              </label>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SquadraSelector;
