
'use client';
import { useRouter } from 'next/navigation';

const distretti = [
  { nome: 'Distretto 1', file: 'distretto1.txt' },
  { nome: 'Distretto 2', file: 'distretto2.txt' },
  { nome: 'Distretto 3', file: 'distretto3.txt' },
  { nome: 'Distretto 4', file: 'distretto4.txt' },
  { nome: 'Distretto 5', file: 'distretto5.txt' },
  { nome: 'Distretto 6', file: 'distretto6.txt' },
  { nome: 'Distretto 7', file: 'distretto7.txt' },
  { nome: 'Distretto 8', file: 'distretto8.txt' },
  { nome: 'Distretto 9', file: 'distretto9.txt' },
  { nome: 'Distretto 10', file: 'distretto10.txt' },
  { nome: 'Distretto 11', file: 'distretto11.txt' },
  { nome: 'Distretto 12', file: 'distretto12.txt' },
  { nome: 'Distretto 13', file: 'distretto13.txt' },
  { nome: 'Capo Cantiere', file: '' }, // ✅ Aggiunta opzione speciale
  {nome:'Servizio-custodia',file:''}
];

const DistrettoSelector = ({ setDistretto }: { setDistretto: (d: string) => void }) => {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === 'Capo Cantiere') {
      router.push('/capo-cantiere'); // ✅ Vai alla pagina dedicata
    } else if(selected === 'Servizio-custodia') {
      router.push('./Servizio-custodia');
    }else{
      setDistretto(selected); // ✅ Funziona normalmente per gli altri
    }
  };

  return (
    <div className="form-group">
      <h3>Seleziona Distretto</h3>
      <select onChange={handleChange} defaultValue="">
        <option value="" disabled>-- Seleziona --</option>
        {distretti.map((d, i) => (
          <option key={i} value={d.nome}>{d.nome}</option>
        ))}
      </select>
    </div>
  );
};

export default DistrettoSelector;
