import { useState, createContext, useContext, ReactNode } from 'react';

// ======================
// TIPOS
// ======================

export type Cao = {
  id: string;
  nome: string;
  tutor?: string;
  endereco?: string;
};

// ======================
// CONTEXT
// ======================

type CaesContextType = {
  caes: Cao[];
  adicionarCao: (cao: Omit<Cao, 'id'>) => void;
  atualizarCao: (id: string, dados: Partial<Cao>) => void;
};

const CaesContext = createContext<CaesContextType | undefined>(undefined);

// ======================
// PROVIDER
// ======================

const CAES_INICIAIS: Cao[] = [
  { id: '1', nome: 'LUNA', tutor: 'Maria', endereco: 'Rua das Flores' },
  { id: '2', nome: 'JIMMY', tutor: 'Carol', endereco: 'Dois de Dezembro' },
  { id: '3', nome: 'THOR' },
  { id: '4', nome: 'MAX' },
  { id: '5', nome: 'NINA' },
];

export function CaesProvider({ children }: { children: ReactNode }) {
  const [caes, setCaes] = useState<Cao[]>(CAES_INICIAIS);

  function adicionarCao(cao: Omit<Cao, 'id'>) {
    setCaes((prev) => [
      ...prev,
      {
        ...cao,
        id: Date.now().toString(),
      },
    ]);
  }

  function atualizarCao(id: string, dados: Partial<Cao>) {
    setCaes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados } : c))
    );
  }

  return (
    <CaesContext.Provider value={{ caes, adicionarCao, atualizarCao }}>
      {children}
    </CaesContext.Provider>
  );
}

// ======================
// HOOK
// ======================

export function useCaes() {
  const context = useContext(CaesContext);
  if (!context) {
    throw new Error('useCaes deve ser usado dentro de CaesProvider');
  }
  return context;
}
