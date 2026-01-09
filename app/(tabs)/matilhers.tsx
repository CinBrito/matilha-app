import { View, Text, StyleSheet } from 'react-native';

export default function MatilhersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cadastro de Matilhers 🧍</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
