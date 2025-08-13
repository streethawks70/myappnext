// src/context/MessagesContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

type MessagesContextType = {
  messages: string[];
  addMessage: (msg: string) => void;
};

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) throw new Error("useMessages deve essere usato dentro MessagesProvider");
  return context;
}
