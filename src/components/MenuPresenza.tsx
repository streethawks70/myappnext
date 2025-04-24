const opzioni = [
    'Presenza',
    'Assenza',
    'Ferie',
    'Malattia',
    'Infortunio',
    'Donazione sangue',
    'Permesso Sindacale',
    'Cassa Integrazione',
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
      <div style={{ marginTop: '1rem' }}>
        <h3>Tipo di Presenza</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {opzioni.map((op, i) => (
            <button
              key={i}
              onClick={() => onSelect(op)}
              style={{
                backgroundColor: selected === op ? '#4caf50' : '#f0f0f0',
                color: selected === op ? 'white' : 'black',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                border: '1px solid #ccc',
                cursor: 'pointer',
              }}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  export default MenuPresenza;
  