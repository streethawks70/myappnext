'use client';
import { useState } from 'react';
import { useNotification } from './Campanello/NotificationProvider';

export default function BellNotifications() {
  const { comunicazioni, unreadCount, markAllRead } = useNotification();
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
    if (!open) markAllRead(); // segna tutte come lette quando apri
  };

  return (
    <div className="fixed top-4 right-4 z-50 inline-block">
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-700 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 w-9"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 
            6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 
            6.165 6 8.388 6 11v3.159c0 .538-.214 
            1.055-.595 1.436L4 17h5m6 0v1a3 3 
            0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-3 z-50">
          <h4 className="font-semibold mb-2">Comunicazioni</h4>
          <ul className="max-h-60 overflow-y-auto text-sm">
            {comunicazioni.length === 0 && <li>Nessuna comunicazione</li>}
            {comunicazioni.map(m => {
              const isNew = new Date(m.createdAtISO).getTime() > 
                            Number(localStorage.getItem('lastSeen') || 0);

              return (
                <li key={m.id} className="mb-1 border-b pb-1 flex justify-between items-center">
                  <span>{m.testo}</span>
                  {isNew && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      Nuovo
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
