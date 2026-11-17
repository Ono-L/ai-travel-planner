import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Expense } from '@trip-splitter/shared';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

// 支出表示カードコンポーネント (docs/03_Rules/coding_rules.md 準拠)
export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{expense.title}</Text>
      <Text style={styles.amount}>¥{expense.amount.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 8, backgroundColor: '#FFFFFF' },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  amount: { fontSize: 18, fontWeight: '700', color: '#1A56DB' },
});
