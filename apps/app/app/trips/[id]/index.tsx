import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-03: トリップ詳細（支出一覧） (docs/01_Requirements/screen_spec.md 準拠)
export default function TripDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>トリップ詳細・支出一覧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827' },
});
