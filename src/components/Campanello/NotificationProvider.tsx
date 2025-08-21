'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Comunicazione = { id: string; testo: string; createdAtISO: string };

type NotificationContextType = {
  comunicazioni: Comunicazione[];
  unreadCount: number;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [comunicazioni, setComunicazioni] = useState<Comunicazione[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(0);

  // Carica lastSeen dal localStorage solo sul client
  useEffect(() => {
    const saved = localStorage.getItem('lastSeen');
    if (saved) setLastSeen(Number(saved));
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/gas1-proxy1');
      const data = await res.json();
      setComunicazioni(data);
    } catch (err) {
      console.error('Errore fetch comunicazioni:', err);
    }
  };

  useEffect(() => {
    fetchData(); // subito
    const id = setInterval(fetchData, 5000); // ogni 5 secondi
    return () => clearInterval(id);
  }, []);

  const unreadCount = comunicazioni.filter(
    m => new Date(m.createdAtISO).getTime() > lastSeen
  ).length;

  const markAllRead = () => {
    if (comunicazioni[0]) {
      const t = new Date(comunicazioni[0].createdAtISO).getTime();
      setLastSeen(t);
      localStorage.setItem('lastSeen', String(t)); // sicuro perché eseguito solo sul client
    }
  };

  return (
    <NotificationContext.Provider value={{ comunicazioni, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
};
