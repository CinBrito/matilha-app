import { useState, createContext, useContext, ReactNode } from 'react';

// ======================
// TIPOS
// ======================

export type PasseadorNaMatilha = {
  id: string;
  nome: string;
  avatarUrl?: string | any; // string para URL ou require() para assets locais
};

export type CaoNaMatilha = {
  id: string;
  nome: string;
  pago: boolean;
};

export type Matilha = {
  id: string;
  data: string; // DD/MM/YYYY
  tipo: 'Sábado' | 'Domingo' | 'Feriado';
  precoPorCao: number;
  passeadores: PasseadorNaMatilha[];
  caes: CaoNaMatilha[];
  comentario?: string;
};

// ======================
// CONTEXT
// ======================

type MatilhasContextType = {
  matilhas: Matilha[];
  adicionarMatilha: (matilha: Omit<Matilha, 'id'>) => void;
  atualizarMatilha: (id: string, dados: Partial<Matilha>) => void;
  removerMatilha: (id: string) => void;
};

const MatilhasContext = createContext<MatilhasContextType | undefined>(undefined);

// ======================
// PROVIDER
// ======================

const MATILHAS_INICIAIS: Matilha[] = [
  {
    id: '1',
    data: '10/01/2026',
    tipo: 'Sábado',
    precoPorCao: 40,
    passeadores: [
      { id: 'p1', nome: 'Ana', avatarUrl: require('../assets/avatars/ana.png') },
      { id: 'p2', nome: 'Bruno', avatarUrl: require('../assets/avatars/bruno.png') },
    ],
    caes: [
      { id: '3', nome: 'THOR', pago: true },
      { id: '4', nome: 'MAX', pago: true },
    ],
  },
];

export function MatilhasProvider({ children }: { children: ReactNode }) {
  const [matilhas, setMatilhas] = useState<Matilha[]>(MATILHAS_INICIAIS);

  function adicionarMatilha(matilha: Omit<Matilha, 'id'>) {
    setMatilhas((prev) => [
      ...prev,
      {
        ...matilha,
        id: Date.now().toString(),
      },
    ]);
  }

  function atualizarMatilha(id: string, dados: Partial<Matilha>) {
    setMatilhas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...dados } : m))
    );
  }

  function removerMatilha(id: string) {
    setMatilhas((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <MatilhasContext.Provider value={{ matilhas, adicionarMatilha, atualizarMatilha, removerMatilha }}>
      {children}
    </MatilhasContext.Provider>
  );
}

// ======================
// HOOK
// ======================

export function useMatilhas() {
  const context = useContext(MatilhasContext);
  if (!context) {
    throw new Error('useMatilhas deve ser usado dentro de MatilhasProvider');
  }
  return context;
}

// ======================
// UTILITÁRIOS
// ======================

export function parsearData(dataStr: string): Date | null {
  // Converte DD/MM/YYYY para Date
  const partes = dataStr.split('/');
  if (partes.length !== 3) return null;
  
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // Mês é 0-indexed
  const ano = parseInt(partes[2], 10);
  
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
  
  const data = new Date(ano, mes, dia);
  if (data.getDate() !== dia || data.getMonth() !== mes || data.getFullYear() !== ano) {
    return null; // Data inválida
  }
  
  return data;
}

export function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function obterTipoMatilha(data: Date): 'Sábado' | 'Domingo' | 'Feriado' {
  const diaSemana = data.getDay();
  if (diaSemana === 6) return 'Sábado';
  if (diaSemana === 0) return 'Domingo';
  return 'Feriado';
}

export function ordenarMatilhas(matilhas: Matilha[]): Matilha[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const futuras: Matilha[] = [];
  const passadas: Matilha[] = [];
  
  matilhas.forEach((matilha) => {
    const data = parsearData(matilha.data);
    if (!data) return;
    
    data.setHours(0, 0, 0, 0);
    
    if (data >= hoje) {
      futuras.push(matilha);
    } else {
      passadas.push(matilha);
    }
  });
  
  // Ordenar futuras: mais próximas primeiro (crescente)
  futuras.sort((a, b) => {
    const dataA = parsearData(a.data);
    const dataB = parsearData(b.data);
    if (!dataA || !dataB) return 0;
    return dataA.getTime() - dataB.getTime();
  });
  
  // Ordenar passadas: mais recentes primeiro (decrescente)
  passadas.sort((a, b) => {
    const dataA = parsearData(a.data);
    const dataB = parsearData(b.data);
    if (!dataA || !dataB) return 0;
    return dataB.getTime() - dataA.getTime();
  });
  
  return [...futuras, ...passadas];
}
