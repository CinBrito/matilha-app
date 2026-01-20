import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { usePasseadores, Passeador } from '@/hooks/use-passeadores';

// ======================
// TELA
// ======================

export default function MatilhersScreen() {
  const { passeadores, adicionarPasseador, atualizarPasseador, removerPasseador } = usePasseadores();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [passeadorSelecionado, setPasseadorSelecionado] = useState<Passeador | null>(null);
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const nomeExiste = passeadores.some(
    (p) =>
      p.nome.toUpperCase() === nome.trim().toUpperCase() &&
      p.id !== passeadorSelecionado?.id
  );

  const passeadoresFiltrados = passeadores.filter((p) =>
    p.nome.toUpperCase().includes(busca.trim().toUpperCase())
  );

  function formatarTelefone(texto: string): string {
    // Remove tudo que não é número
    const numeros = texto.replace(/\D/g, '');
    
    // Aplica máscara (xx) xxxxx-xxxx
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  }

  function limparFormulario() {
    setNome('');
    setTelefone('');
    setPasseadorSelecionado(null);
    setFeedback('');
    setAvatarPreview(null);
  }

  function handleAdicionarPasseador() {
    if (!nome.trim() || nomeExiste) return;

    adicionarPasseador({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      avatarUrl: avatarPreview || undefined,
    });

    setFeedback('👤 Passeador adicionado');
    limparFormulario();
  }

  function salvarEdicao() {
    if (!passeadorSelecionado) return;

    atualizarPasseador(passeadorSelecionado.id, {
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      avatarUrl: avatarPreview || passeadorSelecionado.avatarUrl || undefined,
    });

    setFeedback('💾 Alterações salvas');
    limparFormulario();
  }

  function selecionarPasseador(passeador: Passeador) {
    setPasseadorSelecionado(passeador);
    setNome(passeador.nome);
    setTelefone(passeador.telefone || '');
    setFeedback('');
    setAvatarPreview(null); // Reset preview ao selecionar
  }

  function obterInicial(nome: string): string {
    return nome.trim().charAt(0).toUpperCase();
  }

  function handleRemoverPasseador(passeadorId: string, passeadorNome: string) {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir ${passeadorNome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removerPasseador(passeadorId);
            if (passeadorSelecionado?.id === passeadorId) {
              limparFormulario();
            }
            setFeedback('👤 Passeador removido');
            setTimeout(() => setFeedback(''), 2500);
          },
        },
      ]
    );
  }

  async function selecionarFoto() {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Salvar URI da imagem selecionada
        setAvatarPreview(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível selecionar a imagem.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>MATILHERS</Text>

      <View style={styles.card}>
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={selecionarFoto} style={styles.avatarButton}>
            {avatarPreview ? (
              <Image 
                source={{ uri: avatarPreview }} 
                style={styles.avatarPreview} 
              />
            ) : passeadorSelecionado?.avatarUrl ? (
              <Image 
                source={typeof passeadorSelecionado.avatarUrl === 'string' 
                  ? { uri: passeadorSelecionado.avatarUrl } 
                  : passeadorSelecionado.avatarUrl} 
                style={styles.avatarPreview} 
              />
            ) : (
              <View style={styles.avatarPreviewPlaceholder}>
                <Text style={styles.avatarPreviewText}>
                  {passeadorSelecionado ? obterInicial(passeadorSelecionado.nome) : '📷'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>
            {passeadorSelecionado ? 'Toque para alterar foto' : 'Toque para adicionar foto'}
          </Text>
        </View>

        <Text style={styles.label}>NOME *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          editable={!passeadorSelecionado}
          onChangeText={(t) => setNome(t)}
          placeholder="Nome do passeador"
        />

        {nomeExiste && (
          <Text style={styles.error}>Já existe um passeador com esse nome</Text>
        )}

        <Text style={styles.label}>TELEFONE</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={(t) => setTelefone(formatarTelefone(t))}
          placeholder="(xx) xxxxx-xxxx"
          keyboardType="phone-pad"
          maxLength={15}
        />

        {feedback !== '' && (
          <Text style={styles.feedback}>{feedback}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={limparFormulario}>
            <Text style={styles.btnText}>LIMPAR</Text>
          </TouchableOpacity>

          {!passeadorSelecionado ? (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!nome.trim() || nomeExiste) && styles.disabled,
              ]}
              onPress={handleAdicionarPasseador}
              disabled={!nome.trim() || nomeExiste}
            >
              <Text style={styles.btnText}>ADICIONAR</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => passeadorSelecionado && handleRemoverPasseador(passeadorSelecionado.id, passeadorSelecionado.nome)}
              >
                <Text style={styles.btnText}>EXCLUIR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={salvarEdicao}>
                <Text style={styles.btnText}>SALVAR</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Text style={styles.label}>BUSCAR</Text>
      <TextInput
        style={styles.input}
        value={busca}
        onChangeText={(t) => setBusca(t.toUpperCase())}
        placeholder="Buscar passeador..."
      />

      {busca && passeadoresFiltrados.length === 0 && (
        <Text style={styles.emptyText}>Nenhum passeador encontrado</Text>
      )}

      {(busca ? passeadoresFiltrados : passeadores).map((passeador) => (
        <TouchableOpacity
          key={passeador.id}
          style={[
            styles.listItem,
            passeadorSelecionado?.id === passeador.id && styles.listItemSelected,
          ]}
          onPress={() => selecionarPasseador(passeador)}
        >
          <View style={styles.listRow}>
            <View style={styles.listLeft}>
              {passeador.avatarUrl ? (
                <Image 
                  source={typeof passeador.avatarUrl === 'string' 
                    ? { uri: passeador.avatarUrl } 
                    : passeador.avatarUrl} 
                  style={styles.avatarList} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{obterInicial(passeador.nome)}</Text>
                </View>
              )}
              <View>
                <Text style={styles.listText}>👤 {passeador.nome}</Text>
                {passeador.telefone && (
                  <Text style={styles.listSubtext}>{passeador.telefone}</Text>
                )}
              </View>
            </View>
            {passeadorSelecionado?.id === passeador.id && (
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
    marginBottom: 8,
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
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#7c2d12',
    padding: 10,
    borderRadius: 20,
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#b91c1c',
    padding: 10,
    borderRadius: 20,
    flex: 1,
  },
  secondaryBtn: {
    backgroundColor: '#a16207',
    padding: 10,
    borderRadius: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarButton: {
    marginBottom: 8,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  avatarPreviewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7c2d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarLabel: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  avatarList: {
    width: 40,
    height: 40,
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
    alignItems: 'center',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a16207',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7c2d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
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
