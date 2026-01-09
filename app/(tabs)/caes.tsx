import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ======================
// TIPOS
// ======================

type Cao = {
  id: string;
  nome: string;
  tutor?: string;
  endereco?: string;
};

// ======================
// TELA
// ======================

export default function CaesScreen() {
  const [caes, setCaes] = useState<Cao[]>([
    { id: '1', nome: 'LUNA', tutor: 'Maria', endereco: 'Rua das Flores' },
    { id: '2', nome: 'JIMMY', tutor: 'Carol', endereco: 'Dois de Dezembro' },
  ]);

  const [nome, setNome] = useState('');
  const [tutor, setTutor] = useState('');
  const [endereco, setEndereco] = useState('');
  const [caoSelecionado, setCaoSelecionado] = useState<Cao | null>(null);
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState('');

  const nomeExiste = caes.some(
    (c) =>
      c.nome === nome.trim().toUpperCase() &&
      c.id !== caoSelecionado?.id
  );

  const caesFiltrados = caes.filter((c) =>
    c.nome.includes(busca.trim().toUpperCase())
  );

  function limparFormulario() {
    setNome('');
    setTutor('');
    setEndereco('');
    setCaoSelecionado(null);
    setFeedback('');
  }

  function adicionarCao() {
    if (!nome.trim() || nomeExiste) return;

    setCaes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nome: nome.trim().toUpperCase(),
        tutor,
        endereco,
      },
    ]);

    setFeedback('🐾 Cão adicionado');
    limparFormulario();
  }

  function salvarEdicao() {
    if (!caoSelecionado) return;

    setCaes((prev) =>
      prev.map((c) =>
        c.id === caoSelecionado.id
          ? {
              ...c,
              tutor,
              endereco,
            }
          : c
      )
    );

    setFeedback('💾 Alterações salvas');
    limparFormulario();
  }

  function selecionarCao(cao: Cao) {
    setCaoSelecionado(cao);
    setNome(cao.nome);
    setTutor(cao.tutor || '');
    setEndereco(cao.endereco || '');
    setFeedback('');
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CÃES</Text>

      <View style={styles.card}>
        <Text style={styles.label}>NOME *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          editable={!caoSelecionado}
          onChangeText={(t) => setNome(t.toUpperCase())}
          placeholder="Nome do cão"
        />

        {nomeExiste && (
          <Text style={styles.error}>Já existe um cão com esse nome</Text>
        )}

        <Text style={styles.label}>TUTOR</Text>
        <TextInput
          style={styles.input}
          value={tutor}
          onChangeText={setTutor}
        />

        <Text style={styles.label}>ENDEREÇO</Text>
        <TextInput
          style={styles.input}
          value={endereco}
          onChangeText={setEndereco}
        />

        {feedback !== '' && (
          <Text style={styles.feedback}>{feedback}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={limparFormulario}>
            <Text style={styles.btnText}>LIMPAR</Text>
          </TouchableOpacity>

          {!caoSelecionado ? (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!nome.trim() || nomeExiste) && styles.disabled,
              ]}
              onPress={adicionarCao}
              disabled={!nome.trim() || nomeExiste}
            >
              <Text style={styles.btnText}>ADICIONAR</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={salvarEdicao}>
              <Text style={styles.btnText}>SALVAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.label}>BUSCAR</Text>
      <TextInput
        style={styles.input}
        value={busca}
        onChangeText={(t) => setBusca(t.toUpperCase())}
      />

      {busca && caesFiltrados.length === 0 && (
        <Text style={styles.emptyText}>Nenhum cão encontrado</Text>
      )}

      {(busca ? caesFiltrados : caes).map((cao) => (
        <TouchableOpacity
          key={cao.id}
          style={[
            styles.listItem,
            caoSelecionado?.id === cao.id && styles.listItemSelected,
          ]}
          onPress={() => selecionarCao(cao)}
        >
          <View style={styles.listRow}>
            <Text style={styles.listText}>🐾 {cao.nome}</Text>
            {caoSelecionado?.id === cao.id && (
              <Text style={styles.check}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 16,
  },
  title: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#DFBDB2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 13,
  },
  error: {
    color: '#b91c1c',
    fontSize: 11,
  },
  feedback: {
    fontSize: 11,
    fontWeight: '600',
    color: '#14532d',
    marginVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryBtn: {
    backgroundColor: '#7c2d12',
    padding: 10,
    borderRadius: 20,
  },
  secondaryBtn: {
    backgroundColor: '#a16207',
    padding: 10,
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  listItem: {
    backgroundColor: '#DFBDB2',
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
  },
  listItemSelected: {
    borderWidth: 2,
    borderColor: '#E0391C',
    backgroundColor: '#FDECEC',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
  },
  check: {
    color: '#E0391C',
    fontWeight: '900',
  },
});
