import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export function AppHeader() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>MATILHA</Text>{' '}
          <Text style={styles.titleRegular}>CARIOCA</Text>
        </Text>

        
      </View>

      {/* linha divisória */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#0f0f0f',
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    flexDirection: 'row',
  },

  titleHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E0391C', // destaque "Matilha"
    letterSpacing: 1,
  },

  titleRegular: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },

  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },

  divider: {
    height: 2,
    backgroundColor: '#E0391C', // linha sutil
    marginBottom: 16,
  },
});
