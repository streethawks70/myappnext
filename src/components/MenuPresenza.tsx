
const opzioni = [
  'Presenza',
  'Assenza',
  'Sospeso',
  'Ferie',
  'Malattia',
  'Infortunio',
  'Donazione sangue',
  'Permesso sindacale',
  'Cassa integrazione',
  'Permessi Vari',
  'Rientro',
  'Festivita',
  'Uscita',
  
];

const MenuPresenza = ({
  onSelect,
  selected,
}: {
  onSelect: (tipo: string) => void;
  selected: string;
}) => {
  return (
    <div className="form-group mt-4">
      <h3 className="text-lg font-semibold mb-2">Tipo di Presenza</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {opzioni.map((op, i) => (
          <button
            key={i}
            onClick={() => onSelect(op)}
            className={`py-2 px-4 rounded border ${
              selected === op
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-gray-800 border-gray-300'
            }`}
          >
            {op === 'Comunicazioni' ? '📢 Comunicazioni' : op}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuPresenza;
