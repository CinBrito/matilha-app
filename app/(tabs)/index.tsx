import { useCaes } from '@/hooks/use-caes';
import { ordenarMatilhas, parsearData, useMatilhas } from '@/hooks/use-matilhas';
import { usePasseadores } from '@/hooks/use-passeadores';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ======================
// TELA PRINCIPAL
// ======================

export default function HomeScreen() {
  const router = useRouter();
  const { caes: caesBase } = useCaes();
  const { passeadores: passeadoresBase } = usePasseadores();
  const { matilhas, atualizarMatilha } = useMatilhas();

  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [buscaData, setBuscaData] = useState('');
  const [verFuturas, setVerFuturas] = useState(false);
  const [verTodas, setVerTodas] = useState(false);
  
  // Estados por matilha (para busca de cães e passeadores)
  const [buscaCaoPorMatilha, setBuscaCaoPorMatilha] = useState<Record<string, string>>({});
  const [buscaPasseadorPorMatilha, setBuscaPasseadorPorMatilha] = useState<Record<string, string>>({});
  const [mostrarBuscaCaoPorMatilha, setMostrarBuscaCaoPorMatilha] = useState<Record<string, boolean>>({});
  const [mostrarBuscaPasseadorPorMatilha, setMostrarBuscaPasseadorPorMatilha] = useState<Record<string, boolean>>({});
  const [comentarioExpandido, setComentarioExpandido] = useState<Record<string, boolean>>({});
  const [comentarioEditando, setComentarioEditando] = useState<string | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [feedbackPorMatilha, setFeedbackPorMatilha] = useState<Record<string, string>>({});

  // Função para formatar data na busca
  function formatarDataInput(texto: string): string {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }

  // Filtrar e ordenar matilhas
  const matilhasExibidas = useMemo(() => {
    let resultado = ordenarMatilhas(matilhas);
    
    // Busca por data
    if (buscaData.trim()) {
      resultado = resultado.filter(m => m.data.includes(buscaData.trim()));
    }
    
    // Ver futuras
    if (verFuturas) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      resultado = resultado.filter(m => {
        const data = parsearData(m.data);
        return data && data >= hoje;
      });
    }
    
    // Ver todas
    if (!verTodas && !verFuturas) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const futuras = resultado.filter(m => {
        const data = parsearData(m.data);
        return data && data >= hoje;
      });
      const passadas = resultado.filter(m => {
        const data = parsearData(m.data);
        return data && data < hoje;
      });
      
      if (futuras.length > 0) {
        resultado = [futuras[0], ...passadas.slice(0, 2)];
      } else {
        resultado = passadas.slice(0, 3);
      }
    }
    
    return resultado;
  }, [matilhas, buscaData, verFuturas, verTodas]);

  function togglePagamento(matilhaId: string, caoId: string) {
    const matilha = matilhas.find(m => m.id === matilhaId);
    if (!matilha) return;

    atualizarMatilha(matilhaId, {
      caes: matilha.caes.map(cao =>
        cao.id === caoId ? { ...cao, pago: !cao.pago } : cao
      ),
    });
  }

  function removerCaoDaMatilha(matilhaId: string, caoId: string) {
    const matilha = matilhas.find(m => m.id === matilhaId);
    if (!matilha) return;

    atualizarMatilha(matilhaId, {
      caes: matilha.caes.filter(c => c.id !== caoId),
    });

    setFeedbackPorMatilha(prev => ({ ...prev, [matilhaId]: '🐾 Cão removido da matilha' }));
    setTimeout(() => {
      setFeedbackPorMatilha(prev => {
        const novo = { ...prev };
        delete novo[matilhaId];
        return novo;
      });
    }, 2500);
  }

  function adicionarCaoNaMatilha(matilhaId: string, cao: { id: string; nome: string }) {
    const matilha = matilhas.find(m => m.id === matilhaId);
    if (!matilha) return;

    // Verificar se precisa mais passeadores
    const totalCaes = matilha.caes.length + 1;
    const totalPasseadores = matilha.passeadores.length;
    const caesPorPasseador = totalPasseadores > 0 ? totalCaes / totalPasseadores : 0;

    if (caesPorPasseador > 6 && totalPasseadores > 0) {
      Alert.alert(
        'Atenção',
        `Com ${totalCaes} cães e ${totalPasseadores} passeador(es), cada passeador terá ${Math.ceil(caesPorPasseador)} cães. Considere adicionar mais passeadores.`,
        [{ text: 'OK' }]
      );
    }

    atualizarMatilha(matilhaId, {
      caes: [
        ...matilha.caes,
        {
          id: cao.id,
          nome: cao.nome,
          pago: false,
        },
      ],
    });

    setFeedbackPorMatilha(prev => ({ ...prev, [matilhaId]: `🐾 ${cao.nome} adicionado à matilha` }));
    setBuscaCaoPorMatilha(prev => {
      const novo = { ...prev };
      delete novo[matilhaId];
      return novo;
    });
    setMostrarBuscaCaoPorMatilha(prev => ({ ...prev, [matilhaId]: false }));

    setTimeout(() => {
      setFeedbackPorMatilha(prev => {
        const novo = { ...prev };
        delete novo[matilhaId];
        return novo;
      });
    }, 2500);
  }

  function adicionarPasseadorNaMatilha(matilhaId: string, passeador: { id: string; nome: string; avatarUrl?: string }) {
    const matilha = matilhas.find(m => m.id === matilhaId);
    if (!matilha) return;

    atualizarMatilha(matilhaId, {
      passeadores: [
        ...matilha.passeadores,
        {
          id: passeador.id,
          nome: passeador.nome,
          avatarUrl: passeador.avatarUrl,
        },
      ],
    });

    setFeedbackPorMatilha(prev => ({ ...prev, [matilhaId]: `👤 ${passeador.nome} adicionado à matilha` }));
    setBuscaPasseadorPorMatilha(prev => {
      const novo = { ...prev };
      delete novo[matilhaId];
      return novo;
    });
    setMostrarBuscaPasseadorPorMatilha(prev => ({ ...prev, [matilhaId]: false }));

    setTimeout(() => {
      setFeedbackPorMatilha(prev => {
        const novo = { ...prev };
        delete novo[matilhaId];
        return novo;
      });
    }, 2500);
  }

  function removerPasseadorDaMatilha(matilhaId: string, passeadorId: string) {
    const matilha = matilhas.find(m => m.id === matilhaId);
    if (!matilha) return;

    atualizarMatilha(matilhaId, {
      passeadores: matilha.passeadores.filter(p => p.id !== passeadorId),
    });

    setFeedbackPorMatilha(prev => ({ ...prev, [matilhaId]: '👤 Passeador removido da matilha' }));
    setTimeout(() => {
      setFeedbackPorMatilha(prev => {
        const novo = { ...prev };
        delete novo[matilhaId];
        return novo;
      });
    }, 2500);
  }

  function obterInicial(nome: string): string {
    return nome.trim().charAt(0).toUpperCase();
  }

  function salvarComentario(matilhaId: string) {
    atualizarMatilha(matilhaId, {
      comentario: comentarioTexto.trim() || undefined,
    });
    setComentarioEditando(null);
    setComentarioTexto('');
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER COM BOTÕES */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => router.push('/matilha-form')}
        >
          <Text style={styles.headerBtnText}>➕ NOVA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => setMostrarBusca(!mostrarBusca)}
        >
          <Text style={styles.headerBtnText}>🔍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerBtn, verFuturas && styles.headerBtnAtivo]}
          onPress={() => {
            setVerFuturas(!verFuturas);
            if (!verFuturas) setVerTodas(false);
          }}
        >
          <Text style={styles.headerBtnText}>VER FUTURAS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerBtn, verTodas && styles.headerBtnAtivo]}
          onPress={() => {
            setVerTodas(!verTodas);
            if (!verTodas) setVerFuturas(false);
          }}
        >
          <Text style={styles.headerBtnText}>VER TODAS</Text>
        </TouchableOpacity>
      </View>

      {/* CAMPO DE BUSCA */}
      {mostrarBusca && (
        <View style={styles.buscaDataContainer}>
          <TextInput
            style={styles.buscaDataInput}
            value={buscaData}
            onChangeText={(t) => setBuscaData(formatarDataInput(t))}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#999"
            maxLength={10}
            keyboardType="numeric"
          />
        </View>
      )}

      {matilhasExibidas.map((matilha) => {
        const totalCaes = matilha.caes.length;
        const caesPagos = matilha.caes.filter((c) => c.pago).length;
        const totalPessoas = matilha.passeadores.length;

        const valorEsperadoTotal = matilha.precoPorCao * totalCaes;
        const valorEsperadoPorPessoa = totalPessoas > 0 ? valorEsperadoTotal / totalPessoas : 0;

        const valorRecebidoTotal = matilha.precoPorCao * caesPagos;
        const valorRecebidoPorPessoa = totalPessoas > 0 ? valorRecebidoTotal / totalPessoas : 0;

        const mostrarBuscaCao = mostrarBuscaCaoPorMatilha[matilha.id] || false;
        const mostrarBuscaPasseador = mostrarBuscaPasseadorPorMatilha[matilha.id] || false;
        const buscaCao = buscaCaoPorMatilha[matilha.id] || '';
        const buscaPasseador = buscaPasseadorPorMatilha[matilha.id] || '';
        const comentarioExp = comentarioExpandido[matilha.id] || false;
        const feedback = feedbackPorMatilha[matilha.id] || '';

        return (
          <View key={matilha.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{`MATILHA ${matilha.tipo.toUpperCase()} – ${matilha.data}`}</Text>
              <View style={styles.cardHeaderActions}>
                {matilha.comentario && (
                  <TouchableOpacity
                    onPress={() => setComentarioExpandido(prev => ({ ...prev, [matilha.id]: !comentarioExp }))}
                  >
                    <Text style={styles.comentarioIcon}>💬</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/matilha-form', params: { id: matilha.id } })}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quickInfo}>
              <Text style={styles.quickItem}>🐶 {totalCaes} cães</Text>
              <Text style={styles.quickItem}>✅ {caesPagos} pagos</Text>
              <Text style={styles.quickItem}>⚠️ {totalCaes - caesPagos} pendente(s)</Text>
            </View>

            <View style={styles.columns}>
              {/* PASSEADORES */}
              <View style={[styles.column, styles.columnBorder]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>PASSEADORES</Text>
                  <TouchableOpacity
                    onPress={() => setMostrarBuscaPasseadorPorMatilha(prev => ({ ...prev, [matilha.id]: !mostrarBuscaPasseador }))}
                  >
                    <Text style={styles.addIcon}>➕</Text>
                  </TouchableOpacity>
                </View>

                {feedback && feedback.includes('Passeador') && (
                  <Text style={styles.feedbackCao}>{feedback}</Text>
                )}

                {mostrarBuscaPasseador && (
                  <View style={styles.buscaContainer}>
                    <TextInput
                      style={styles.buscaInput}
                      value={buscaPasseador}
                      onChangeText={(text) => setBuscaPasseadorPorMatilha(prev => ({ ...prev, [matilha.id]: text.toUpperCase() }))}
                      placeholder="Buscar passeador..."
                      placeholderTextColor="#999"
                    />
                    {buscaPasseador.trim() && (
                      <View style={styles.buscaResultados}>
                        {passeadoresBase.filter(
                          (p) =>
                            p.nome.toUpperCase().includes(buscaPasseador.trim()) &&
                            !matilha.passeadores.some((pa) => pa.id === p.id)
                        ).map((p) => (
                          <TouchableOpacity
                            key={p.id}
                            style={styles.buscaItem}
                            onPress={() => adicionarPasseadorNaMatilha(matilha.id, p)}
                          >
                            <Text style={styles.buscaItemText}>👤 {p.nome}</Text>
                          </TouchableOpacity>
                        ))}
                        {passeadoresBase.filter(
                          (p) =>
                            p.nome.toUpperCase().includes(buscaPasseador.trim()) &&
                            !matilha.passeadores.some((pa) => pa.id === p.id)
                        ).length === 0 && (
                          <Text style={styles.buscaVazia}>
                            Nenhum passeador disponível encontrado
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.passeadoresGrid}>
                  {matilha.passeadores.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onLongPress={() => removerPasseadorDaMatilha(matilha.id, p.id)}
                      style={styles.avatarContainer}
                    >
                      {p.avatarUrl ? (
                        <Image source={typeof p.avatarUrl === 'string' ? { uri: p.avatarUrl } : p.avatarUrl} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarPlaceholderText}>{obterInicial(p.nome)}</Text>
                        </View>
                      )}
                      <Text style={styles.avatarName}>{p.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* CÃES */}
              <View style={[styles.column, styles.columnBorder]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>CÃES</Text>
                  <TouchableOpacity
                    onPress={() => setMostrarBuscaCaoPorMatilha(prev => ({ ...prev, [matilha.id]: !mostrarBuscaCao }))}
                  >
                    <Text style={styles.addIcon}>➕</Text>
                  </TouchableOpacity>
                </View>

                {feedback && feedback.includes('Cão') && (
                  <Text style={styles.feedbackCao}>{feedback}</Text>
                )}

                {mostrarBuscaCao && (
                  <View style={styles.buscaContainer}>
                    <TextInput
                      style={styles.buscaInput}
                      value={buscaCao}
                      onChangeText={(text) => setBuscaCaoPorMatilha(prev => ({ ...prev, [matilha.id]: text.toUpperCase() }))}
                      placeholder="Buscar cão..."
                      placeholderTextColor="#999"
                    />
                    {buscaCao.trim() && (
                      <View style={styles.buscaResultados}>
                        {caesBase.filter(
                          (cao) =>
                            cao.nome.includes(buscaCao.trim()) &&
                            !matilha.caes.some((c) => c.id === cao.id)
                        ).map((cao) => (
                          <TouchableOpacity
                            key={cao.id}
                            style={styles.buscaItem}
                            onPress={() => adicionarCaoNaMatilha(matilha.id, cao)}
                          >
                            <Text style={styles.buscaItemText}>🐾 {cao.nome}</Text>
                          </TouchableOpacity>
                        ))}
                        {caesBase.filter(
                          (cao) =>
                            cao.nome.includes(buscaCao.trim()) &&
                            !matilha.caes.some((c) => c.id === cao.id)
                        ).length === 0 && (
                          <Text style={styles.buscaVazia}>
                            Nenhum cão disponível encontrado
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.subSectionTitle}>PENDENTES</Text>
                <View style={styles.row}>
                  {matilha.caes.filter((c) => !c.pago).map((cao) => (
                    <TouchableOpacity
                      key={cao.id}
                      onLongPress={() => removerCaoDaMatilha(matilha.id, cao.id)}
                      style={[styles.dogBadge, styles.dogRow]}
                    >
                      <Text style={styles.dogText}>🐾 {cao.nome}</Text>
                      <TouchableOpacity
                        onPress={() => togglePagamento(matilha.id, cao.id)}
                        style={[styles.statusBadge, styles.statusNaoPago]}
                      >
                        <Text style={styles.statusText}>NÃO PAGO</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.subSectionTitle}>PAGOS</Text>
                <View style={styles.row}>
                  {matilha.caes.filter((c) => c.pago).map((cao) => (
                    <TouchableOpacity
                      key={cao.id}
                      onLongPress={() => removerCaoDaMatilha(matilha.id, cao.id)}
                      style={[styles.dogBadge, styles.dogBadgePago, styles.dogRow]}
                    >
                      <Text style={styles.dogText}>🐾 {cao.nome}</Text>
                      <TouchableOpacity
                        onPress={() => togglePagamento(matilha.id, cao.id)}
                        style={[styles.statusBadge, styles.statusPago]}
                      >
                        <Text style={styles.statusText}>PAGO</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


              {/* RESUMO */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>RESUMO</Text>

                <View style={styles.valorBox}>
                  <Text style={styles.valorIcon}>💰</Text>
                  <View>
                    <Text style={styles.valorLabel}>ESPERADO</Text>
                    <Text style={styles.valorNumber}>R$ {valorEsperadoTotal}</Text>
                    {totalPessoas > 0 && (
                      <Text style={styles.valorSub}>R$ {valorEsperadoPorPessoa.toFixed(2)} / pessoa</Text>
                    )}
                  </View>
                </View>

                <View style={styles.valorBox}>
                  <Text style={styles.valorIcon}>✅</Text>
                  <View>
                    <Text style={styles.valorLabel}>RECEBIDO</Text>
                    <Text style={styles.valorNumber}>R$ {valorRecebidoTotal}</Text>
                    {totalPessoas > 0 && (
                      <Text style={styles.valorSub}>R$ {valorRecebidoPorPessoa.toFixed(2)} / pessoa</Text>
                    )}
                  </View>
                </View>

                <View
                  style={[
                    styles.diferencaBox,
                    valorEsperadoTotal - valorRecebidoTotal === 0
                      ? styles.diferencaOk
                      : styles.diferencaPendente,
                  ]}
                >
                  <Text style={styles.diferencaText}>
                    {valorEsperadoTotal - valorRecebidoTotal === 0
                      ? '🎉 TUDO CERTO'
                      : `⚠️ FALTAM R$ ${valorEsperadoTotal - valorRecebidoTotal}`}
                  </Text>
                </View>
              </View>
            </View>

            {/* COMENTÁRIO EXPANDIDO */}
            {comentarioExp && (
              <View style={styles.comentarioSection}>
                <TouchableOpacity
                  onLongPress={() => {
                    setComentarioEditando(matilha.id);
                    setComentarioTexto(matilha.comentario || '');
                  }}
                >
                  <Text style={styles.comentarioText}>
                    {matilha.comentario || 'Nenhum comentário'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* MODAL DE EDIÇÃO DE COMENTÁRIO */}
      <Modal
        visible={comentarioEditando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setComentarioEditando(null);
          setComentarioTexto('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>EDITAR COMENTÁRIO</Text>
            <TextInput
              style={styles.modalTextArea}
              value={comentarioTexto}
              onChangeText={setComentarioTexto}
              placeholder="Ex: Encontrar no ícone e buscar cães no adriano. Cacau está na casa do Lucas."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setComentarioEditando(null);
                  setComentarioTexto('');
                }}
              >
                <Text style={styles.modalBtnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={() => comentarioEditando && salvarComentario(comentarioEditando)}
              >
                <Text style={styles.modalBtnText}>SALVAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  subSectionTitle: {
    fontWeight: '700',
    fontSize: 11,
    color: '#7c2d12',
    marginBottom: 6,
    marginTop: 8,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1c',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#DFBDB2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#1c1c1c',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#b08968',
    paddingTop: 12,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  columnBorder: {
    borderRightWidth: 1,
    borderRightColor: '#b08968',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#7c2d12',
    marginBottom: 8,
  },
  passeadoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    width: 56,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a16207',
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 11,
    color: '#1c1c1c',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dogBadge: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPago: {
    backgroundColor: '#15803d',
  },
  statusNaoPago: {
    backgroundColor: '#9ca3af',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  dogBadgePago: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  dogText: {
    color: '#1c1c1c',
    fontSize: 12,
  },
  valorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  valorIcon: {
    fontSize: 18,
  },
  valorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c2d12',
  },
  valorNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1c',
  },
  valorSub: {
    fontSize: 11,
    color: '#444',
  },
  diferencaBox: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  diferencaOk: {
    backgroundColor: '#bbf7d0',
  },
  diferencaPendente: {
    backgroundColor: '#fde68a',
  },
  diferencaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1c1c',
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},

addIcon: {
  fontSize: 16,
  fontWeight: '700',
  color: '#7c2d12',
},

dogActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

removeIcon: {
  fontSize: 14,
},

feedbackCao: {
  fontSize: 11,
  fontWeight: '600',
  color: '#14532d',
  marginBottom: 6,
},
buscaContainer: {
  marginBottom: 12,
},
buscaInput: {
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 12,
  color: '#1c1c1c',
  borderWidth: 1,
  borderColor: '#b08968',
  marginBottom: 8,
},
buscaResultados: {
  maxHeight: 120,
},
buscaItem: {
  backgroundColor: '#fff',
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 10,
  marginBottom: 4,
  borderWidth: 1,
  borderColor: '#b08968',
},
buscaItemText: {
  fontSize: 12,
  color: '#1c1c1c',
},
buscaVazia: {
  fontSize: 11,
  color: '#666',
  fontStyle: 'italic',
  textAlign: 'center',
  paddingVertical: 8,
},
headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  gap: 8,
  flexWrap: 'wrap',
},
headerBtn: {
  backgroundColor: '#7c2d12',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  flex: 1,
  minWidth: 80,
},
headerBtnAtivo: {
  backgroundColor: '#E0391C',
},
headerBtnText: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '700',
  textAlign: 'center',
},
buscaDataContainer: {
  marginBottom: 12,
},
buscaDataInput: {
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#1c1c1c',
  borderWidth: 1,
  borderColor: '#b08968',
},
cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  position: 'relative',
},
cardHeaderActions: {
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
},
comentarioIcon: {
  fontSize: 18,
},
editIcon: {
  fontSize: 18,
},
avatarPlaceholderText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
comentarioSection: {
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#b08968',
},
comentarioText: {
  fontSize: 12,
  color: '#1c1c1c',
  lineHeight: 18,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
modalContent: {
  backgroundColor: '#DFBDB2',
  borderRadius: 12,
  padding: 20,
  width: '100%',
  maxWidth: 400,
},
modalTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#7c2d12',
  marginBottom: 12,
},
modalTextArea: {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  minHeight: 120,
  fontSize: 14,
  color: '#1c1c1c',
  marginBottom: 16,
  textAlignVertical: 'top',
},
modalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
},
modalBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
modalBtnCancel: {
  backgroundColor: '#9ca3af',
},
modalBtnSave: {
  backgroundColor: '#7c2d12',
},
modalBtnText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '700',
},

});