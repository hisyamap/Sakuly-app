import { useDataStore } from '../store/useDataStore';

export function useExpenses() {
  const expenses = useDataStore(s => s.expenses);
  const reload = useDataStore(s => s.load);
  const remove = useDataStore(s => s.deleteExpense);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, reload, remove, totalExpenses };
}