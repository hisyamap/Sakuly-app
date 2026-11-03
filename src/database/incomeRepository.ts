import AsyncStorage from '@react-native-async-storage/async-storage';

const INCOME_KEY = '@sakuly_income';
export type Recurring =
  | ''
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'cancel';

export const RECCURING : { label: string; value: Recurring }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Cancel', value: 'cancel' }
];

export type Income = {
  id: string;
  name: string;
  amount: number;
  category: string;
  incomeDate: number;
  recurring?: Recurring;
};

export function countOccurrences(
  start: number,
  recurring: Recurring = '',
  now: number = Date.now(),
): number {
  if (start > now) return 0;

  const s = new Date(start);
  const n = new Date(now);
  const days = Math.floor((now - start) / 86_400_000);

  switch (recurring) {
    case 'daily':
      return days + 1;

    case 'weekly':
      return Math.floor(days / 7) + 1;

    case 'monthly': {
      let m =
        (n.getFullYear() - s.getFullYear()) * 12 +
        n.getMonth() -
        s.getMonth();

      if (n.getDate() < s.getDate()) m--;
      return m + 1;
    }

    case 'yearly': {
      let y = n.getFullYear() - s.getFullYear();

      if (
        n.getMonth() < s.getMonth() ||
        (n.getMonth() === s.getMonth() &&
          n.getDate() < s.getDate())
      ) {
        y--;
      }

      return y + 1;
    }

    case 'cancel':
    case '':
    default:
      return 1;
  }
}

export function getTotalEarned(income: Income, now: number = Date.now()): number {
  return income.amount * countOccurrences(income.incomeDate, income.recurring, now);
}

export function getEarnedBetween(income: Income, start: number, end: number): number {
  const before = countOccurrences(income.incomeDate, income.recurring, start - 1);
  const upTo = countOccurrences(income.incomeDate, income.recurring, end - 1);
  return income.amount * (upTo - before);
}

async function getIncome(): Promise<Income[]> {
  try {
    const storedIncome = await AsyncStorage.getItem(INCOME_KEY);

    if (!storedIncome) {
      return [];
    }

    return JSON.parse(storedIncome);
  } catch (error) {
    console.error('Failed to get income:', error);
    return [];
  }
}

export async function addIncome(
  name: string,
  amount: number,
  category: string,
  incomeDate: number, 
  recurring: Recurring,
): Promise<Income> {
  const income = await getIncome();

  const newIncome: Income = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    incomeDate,
    recurring
  };

  income.push(newIncome);

  await AsyncStorage.setItem(
    INCOME_KEY,
    JSON.stringify(income),
  );

  return newIncome;
}

export async function getAllIncomes(): Promise<Income[]> {
  return await getIncome();
}

export async function deleteIncome(id: string): Promise<void> {
  const income = await getIncome();

  const filteredIncome = income.filter(
    income => income.id !== id,
  );

  await AsyncStorage.setItem(
    INCOME_KEY,
    JSON.stringify(filteredIncome),
  );
}

export async function clearIncome(): Promise<void> {
  await AsyncStorage.removeItem(INCOME_KEY);
}