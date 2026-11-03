import ExpenseItem from '@/components/ExpenseItem';
import SakuCard from '@/components/SakuCard';
import { useExpenses } from '@/hooks/useExpenses';
import { useRecentItems } from '@/hooks/useRecentItems';
import { colors, globalStyles } from '@/styles/global';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const { expenses, remove: handleDeleteExpense } = useExpenses();

  const recentExpenses = useRecentItems(
    expenses,
    e => new Date(e.expenseDate).getTime(),
    450, // Saku Card height
  );

  return (
    <FlatList
      style={globalStyles.container}
      data={recentExpenses}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <SakuCard expenses={expenses} />
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ExpenseItem
          id={item.id}
          name={item.name}
          amount={item.amount}
          category={item.category}
          expenseDate={item.expenseDate}
          onDelete={handleDeleteExpense}
        />
      )}
      ListEmptyComponent={
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>No expenses found</Text>
        </View>
      }
      ListFooterComponent={() =>
        recentExpenses.length > 0 ? (
          <View style={styles.viewAllContainer}>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => router.push('/history?tab=expense')}
            >
              <Text style={styles.viewAllText}>View All Expenses</Text>
            </Pressable>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  viewAllContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  viewAllButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  viewAllText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
})
