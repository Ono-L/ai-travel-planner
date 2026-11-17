import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-05: 清算サマリー・送金ルート (docs/01_Requirements/screen_spec.md 準拠)
export default function SettlementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>清算サマリー・最小送金ルート</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827' },
});
