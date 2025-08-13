// app/maintenance/page.tsx  (Next.js App Router)
// oppure pages/maintenance.tsx (Pages Router)
'use client';
export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      {/* Icona ingranaggio animata */}
      <div className="mb-8 animate-spin-slow rounded-full bg-slate-800 p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.52-.88 3.366.966 2.486 2.486a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.88 1.52-.966 3.366-2.486 2.486a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.52.88-3.366-.966-2.486-2.486a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.88-1.52.966-3.366 2.486-2.486.987.571 2.147.149 2.573-1.066z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      {/* Titolo */}
      <h1 className="mb-4 text-3xl font-bold">Pagina in lavorazione</h1>

      {/* Testo */}
      <p className="mb-6 max-w-md text-center text-slate-300">
        Stiamo preparando qualcosa di speciale. Torna presto a trovarci!
      </p>

      {/* Finta barra di avanzamento */}
      <div className="w-64 h-3 rounded-full bg-slate-700 overflow-hidden mb-8">
        <div className="h-full bg-gradient-to-r from-blue-500 to-pink-500 animate-progress" />
      </div>

      {/* Pulsante */}
      <a
        href="/"
        className="rounded-lg bg-blue-500 px-5 py-2 text-white font-medium hover:bg-blue-600 transition"
      >
        Torna alla Home
      </a>

      <style jsx>{`
        /* Animazione ingranaggio lenta */
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        /* Barra di avanzamento che si muove avanti-indietro */
        @keyframes progress {
          0% {
            width: 20%;
          }
          50% {
            width: 90%;
          }
          100% {
            width: 20%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
