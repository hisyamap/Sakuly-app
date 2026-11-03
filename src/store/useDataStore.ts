import { Expense, addExpense, deleteExpense, getAllExpenses } from '@/database/expenseRepository';
import { Income, addIncome, deleteIncome, getAllIncomes } from '@/database/incomeRepository';
import { create } from 'zustand';

type DataState = {
  incomes: Income[];
  expenses: Expense[];
  load: () => Promise<void>;
  addIncome: (...args: Parameters<typeof addIncome>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (...args: Parameters<typeof addExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};

export const useDataStore = create<DataState>((set) => {
  const refreshIncomes = async () => set({ incomes: await getAllIncomes() });
  const refreshExpenses = async () => set({ expenses: await getAllExpenses() });

  return {
    incomes: [],
    expenses: [],

    load: async () => {
      try {
        await Promise.all([refreshIncomes(), refreshExpenses()]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    },

    addIncome: async (...args) => { await addIncome(...args); await refreshIncomes(); },
    deleteIncome: async (id) => { await deleteIncome(id); await refreshIncomes(); },
    addExpense: async (...args) => { await addExpense(...args); await refreshExpenses(); },
    deleteExpense: async (id) => { await deleteExpense(id); await refreshExpenses(); },
  };
});