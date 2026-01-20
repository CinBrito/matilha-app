import { useState, createContext, useContext, ReactNode } from 'react';

// ======================
// TIPOS
// ======================

export type Passeador = {
  id: string;
  nome: string;
  telefone?: string;
  avatarUrl?: string;
};

// ======================
// CONTEXT
// ======================

type PasseadoresContextType = {
  passeadores: Passeador[];
  adicionarPasseador: (passeador: Omit<Passeador, 'id'>) => void;
  atualizarPasseador: (id: string, dados: Partial<Passeador>) => void;
  removerPasseador: (id: string) => void;
};

const PasseadoresContext = createContext<PasseadoresContextType | undefined>(undefined);

// ======================
// PROVIDER
// ======================

const PASSEADORES_INICIAIS: Passeador[] = [
  { 
    id: 'p1', 
    nome: 'Ana', 
    avatarUrl: require('../assets/avatars/ana.png'),
    telefone: '(21) 98765-4321'
  },
  { 
    id: 'p2', 
    nome: 'Bruno', 
    avatarUrl: require('../assets/avatars/bruno.png'),
    telefone: '(21) 98765-4322'
  },
];

export function PasseadoresProvider({ children }: { children: ReactNode }) {
  const [passeadores, setPasseadores] = useState<Passeador[]>(PASSEADORES_INICIAIS);

  function adicionarPasseador(passeador: Omit<Passeador, 'id'>) {
    setPasseadores((prev) => [
      ...prev,
      {
        ...passeador,
        id: Date.now().toString(),
      },
    ]);
  }

  function atualizarPasseador(id: string, dados: Partial<Passeador>) {
    setPasseadores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...dados } : p))
    );
  }

  function removerPasseador(id: string) {
    setPasseadores((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <PasseadoresContext.Provider value={{ passeadores, adicionarPasseador, atualizarPasseador, removerPasseador }}>
      {children}
    </PasseadoresContext.Provider>
  );
}

// ======================
// HOOK
// ======================

export function usePasseadores() {
  const context = useContext(PasseadoresContext);
  if (!context) {
    throw new Error('usePasseadores deve ser usado dentro de PasseadoresProvider');
  }
  return context;
}
