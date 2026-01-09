import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

// ======================
// TIPOS
// ======================

type Passeador = {
  id: string;
  nome: string;
  avatarUrl?: any;
};

type CaoNaMatilha = {
  id: string;
  nome: string;
  pago: boolean;
};

type Matilha = {
  id: string;
  data: string;
  tipo: string;
  precoPorCao: number;
  passeadores: Passeador[];
  caes: CaoNaMatilha[];
};

// ======================
// DADOS MOCK
// ======================

const MATILHAS_INICIAIS: Matilha[] = [
  {
    id: '1',
    data: '10/01/2026',
    tipo: 'Sábado',
    precoPorCao: 40,
    passeadores: [
      { id: 'p1', nome: 'Ana', avatarUrl: require('../../assets/avatars/ana.png') },
      { id: 'p2', nome: 'Bruno', avatarUrl: require('../../assets/avatars/bruno.png') },
    ],
    caes: [
      { id: 'c1', nome: 'Thor', pago: true },
      { id: 'c2', nome: 'Lua', pago: false },
      { id: 'c3', nome: 'Max', pago: true },
    ],
  },
];

// ======================
// TELA PRINCIPAL
// ======================

export default function HomeScreen() {
  const [matilhas, setMatilhas] = useState<Matilha[]>(MATILHAS_INICIAIS);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  function togglePagamento(matilhaId: string, caoId: string) {
    setMatilhas((prev) =>
      prev.map((matilha) =>
        matilha.id === matilhaId
          ? {
              ...matilha,
              caes: matilha.caes.map((cao) =>
                cao.id === caoId ? { ...cao, pago: !cao.pago } : cao
              ),
            }
          : matilha
      )
    );
  }

  function animarToggle() {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <ScrollView style={styles.container}>      

      {matilhas.map((matilha) => {
        const totalCaes = matilha.caes.length;
        const caesPagos = matilha.caes.filter((c) => c.pago).length;
        const totalPessoas = matilha.passeadores.length;

        const valorEsperadoTotal = matilha.precoPorCao * totalCaes;
        const valorEsperadoPorPessoa = valorEsperadoTotal / totalPessoas;

        const valorRecebidoTotal = matilha.precoPorCao * caesPagos;
        const valorRecebidoPorPessoa = valorRecebidoTotal / totalPessoas;

        return (
          <View key={matilha.id} style={styles.card}>
            <Text style={styles.cardTitle}>{`MATILHA ${matilha.tipo.toUpperCase()} – ${matilha.data}`}</Text>

            <View style={styles.quickInfo}>
              <Text style={styles.quickItem}>🐶 {totalCaes} cães</Text>
              <Text style={styles.quickItem}>✅ {caesPagos} pagos</Text>
              <Text style={styles.quickItem}>⚠️ {totalCaes - caesPagos} pendente(s)</Text>
            </View>

            <View style={styles.columns}>
              {/* PASSEADORES */}
              <View style={[styles.column, styles.columnBorder]}>
                <Text style={styles.sectionTitle}>PASSEADORES</Text>
                <View style={styles.passeadoresGrid}>
                  {matilha.passeadores.map((p) => (
                    <View key={p.id} style={styles.avatarContainer}>
                      {p.avatarUrl ? (
                        <Image source={p.avatarUrl} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder} />
                      )}
                      <Text style={styles.avatarName}>{p.nome}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* CÃES */}
              <View style={[styles.column, styles.columnBorder]}>
                <Text style={styles.sectionTitle}>CÃES</Text>

                <Text style={styles.subSectionTitle}>PENDENTES</Text>
                <View style={styles.row}>
                  {matilha.caes.filter((c) => !c.pago).map((cao) => (
                    <Animated.View key={cao.id} style={{ transform: [{ scale: scaleAnim }] }}>
                      <TouchableOpacity
                        onPress={() => {
                          animarToggle();
                          togglePagamento(matilha.id, cao.id);
                        }}
                        style={[styles.dogBadge, styles.dogRow]}
                      >
                        <Text style={styles.dogText}>🐾 {cao.nome}</Text>
                        <View style={[styles.statusBadge, styles.statusNaoPago]}>
                          <Text style={styles.statusText}>NÃO PAGO</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>

                <Text style={styles.subSectionTitle}>PAGOS</Text>
                <View style={styles.row}>
                  {matilha.caes.filter((c) => c.pago).map((cao) => (
                    <Animated.View key={cao.id} style={{ transform: [{ scale: scaleAnim }] }}>
                      <TouchableOpacity
                        onPress={() => {
                          animarToggle();
                          togglePagamento(matilha.id, cao.id);
                        }}
                        style={[styles.dogBadge, styles.dogBadgePago, styles.dogRow]}
                      >
                        <Text style={styles.dogText}>🐾 {cao.nome}</Text>
                        <View style={[styles.statusBadge, styles.statusPago]}>
                          <Text style={styles.statusText}>PAGO</Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
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
                    <Text style={styles.valorSub}>R$ {valorEsperadoPorPessoa} / pessoa</Text>
                  </View>
                </View>

                <View style={styles.valorBox}>
                  <Text style={styles.valorIcon}>✅</Text>
                  <View>
                    <Text style={styles.valorLabel}>RECEBIDO</Text>
                    <Text style={styles.valorNumber}>R$ {valorRecebidoTotal}</Text>
                    <Text style={styles.valorSub}>R$ {valorRecebidoPorPessoa} / pessoa</Text>
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
          </View>
        );
      })}
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
});