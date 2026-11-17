import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// SCR-01: トリップ一覧 / ホーム (docs/01_Requirements/screen_spec.md 準拠)
export default function TripListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>トリップ一覧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 22, fontWeight: '700', color: '#111827' },
});
