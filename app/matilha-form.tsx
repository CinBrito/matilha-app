import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMatilhas, parsearData, formatarData, obterTipoMatilha } from '@/hooks/use-matilhas';

export default function MatilhaFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { matilhas, adicionarMatilha, atualizarMatilha, removerMatilha } = useMatilhas();

  const matilhaExistente = params.id ? matilhas.find((m) => m.id === params.id) : null;
  const isEditando = !!matilhaExistente;

  const [data, setData] = useState('');
  const [tipo, setTipo] = useState<'Sábado' | 'Domingo' | 'Feriado'>('Sábado');
  const [precoPorCao, setPrecoPorCao] = useState('40');
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (matilhaExistente) {
      setData(matilhaExistente.data);
      setTipo(matilhaExistente.tipo);
      setPrecoPorCao(matilhaExistente.precoPorCao.toString());
      setComentario(matilhaExistente.comentario || '');
    }
  }, [matilhaExistente]);

  function formatarDataInput(texto: string): string {
    // Remove tudo que não é número
    const numeros = texto.replace(/\D/g, '');
    
    // Aplica máscara DD/MM/YYYY
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else {
      return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    }
  }

  function validarData(): boolean {
    if (!data.trim()) {
      setErro('Data é obrigatória');
      return false;
    }

    const dataObj = parsearData(data);
    if (!dataObj) {
      setErro('Data inválida. Use o formato DD/MM/YYYY');
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataObj < hoje) {
      setErro('A data deve ser futura');
      return false;
    }

    // Verificar duplicata (mesmo dia, excluindo a matilha atual se editando)
    const existeDuplicata = matilhas.some(
      (m) => m.data === data && m.id !== params.id
    );

    if (existeDuplicata) {
      setErro('Já existe uma matilha cadastrada para esta data');
      return false;
    }

    setErro('');
    return true;
  }

  function validarPreco(): boolean {
    const preco = parseInt(precoPorCao, 10);
    if (isNaN(preco) || preco <= 0) {
      setErro('Preço deve ser um número inteiro maior que zero');
      return false;
    }
    return true;
  }

  function handleSalvar() {
    if (!validarData() || !validarPreco()) return;

    const dataObj = parsearData(data);
    if (!dataObj) return;

    const dadosMatilha = {
      data,
      tipo,
      precoPorCao: parseInt(precoPorCao, 10),
      passeadores: matilhaExistente?.passeadores || [],
      caes: matilhaExistente?.caes || [],
      comentario: comentario.trim() || undefined,
    };

    if (isEditando && matilhaExistente) {
      atualizarMatilha(matilhaExistente.id, dadosMatilha);
    } else {
      adicionarMatilha(dadosMatilha);
    }

    router.back();
  }

  function handleDeletar() {
    if (!matilhaExistente) return;

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta matilha?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removerMatilha(matilhaExistente.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelBtn}>CANCELAR</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditando ? 'EDITAR MATILHA' : 'NOVA MATILHA'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>DATA *</Text>
        <TextInput
          style={[styles.input, erro && styles.inputError]}
          value={data}
          onChangeText={(t) => {
            const formatado = formatarDataInput(t);
            setData(formatado);
            setErro('');
            
            // Auto-completar tipo se data completa
            if (formatado.length === 10) {
              const dataObj = parsearData(formatado);
              if (dataObj) {
                const tipoAuto = obterTipoMatilha(dataObj);
                if (tipoAuto !== 'Feriado') {
                  setTipo(tipoAuto);
                }
              }
            }
          }}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          keyboardType="numeric"
        />
        {erro && <Text style={styles.erroText}>{erro}</Text>}

        <Text style={styles.label}>TIPO *</Text>
        <View style={styles.tipoContainer}>
          {(['Sábado', 'Domingo', 'Feriado'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tipoBtn, tipo === t && styles.tipoBtnAtivo]}
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.tipoText, tipo === t && styles.tipoTextAtivo]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>PREÇO POR CÃO (R$)</Text>
        <TextInput
          style={styles.input}
          value={precoPorCao}
          onChangeText={(t) => {
            const numeros = t.replace(/\D/g, '');
            setPrecoPorCao(numeros);
          }}
          placeholder="40"
          keyboardType="numeric"
        />

        <Text style={styles.label}>COMENTÁRIO</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={comentario}
          onChangeText={setComentario}
          placeholder="Ex: Encontrar no ícone e buscar cães no adriano. Cacau está na casa do Lucas."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.actions}>
          {isEditando && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletar}>
              <Text style={styles.deleteBtnText}>EXCLUIR MATILHA</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
            <Text style={styles.saveBtnText}>SALVAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  cancelBtn: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 80,
  },
  card: {
    backgroundColor: '#DFBDB2',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c2d12',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#1c1c1c',
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#b91c1c',
  },
  erroText: {
    color: '#b91c1c',
    fontSize: 11,
    marginTop: 4,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tipoBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tipoBtnAtivo: {
    borderColor: '#7c2d12',
    backgroundColor: '#FDECEC',
  },
  tipoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tipoTextAtivo: {
    color: '#7c2d12',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#7c2d12',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
