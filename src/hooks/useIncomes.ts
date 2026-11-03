import { Income, getTotalEarned } from '@/database/incomeRepository';
import { useDataStore } from '../store/useDataStore';

export function useIncomes() {
  const incomes = useDataStore(s => s.incomes);
  const reload = useDataStore(s => s.load);
  const remove = useDataStore(s => s.deleteIncome);
  const totalIncomes = (incomeList: Income[]): number => {
    return incomeList.reduce((total, income) => total + getTotalEarned(income), 0);
  };
  
  return { incomes, reload, remove, totalIncomes };
}