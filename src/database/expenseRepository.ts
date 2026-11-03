import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@sakuly_expenses';

export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  expenseDate: number;
};

async function getExpenses(): Promise<Expense[]> {
  try {
    const storedExpenses = await AsyncStorage.getItem(EXPENSES_KEY);

    if (!storedExpenses) {
      return [];
    }

    return JSON.parse(storedExpenses);
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return [];
  }
}

export async function addExpense(
  name: string,
  amount: number,
  category: string,
  expenseDate: number,
): Promise<Expense> {
  const expenses = await getExpenses();

  const newExpense: Expense = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    expenseDate,
  };

  expenses.push(newExpense);

  await AsyncStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(expenses),
  );

  return newExpense;
}

export async function getAllExpenses(): Promise<Expense[]> {
  return await getExpenses();
}

export async function deleteExpense(id: string): Promise<void> {
  const expenses = await getExpenses();

  const filteredExpenses = expenses.filter(
    expense => expense.id !== id,
  );

  await AsyncStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(filteredExpenses),
  );
}

export async function clearExpenses(): Promise<void> {
  await AsyncStorage.removeItem(EXPENSES_KEY);
}