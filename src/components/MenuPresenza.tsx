
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
      <div className="form-group">
        <h3>Tipo di Presenza</h3>
        <div className="button-group">
          {opzioni.map((op, i) => (
            <button
              key={i}
              onClick={() => onSelect(op)}
              className={selected === op ? 'selected' : ''}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  export default MenuPresenza;
  