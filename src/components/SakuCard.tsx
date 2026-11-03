import { Expense } from "@/database/expenseRepository";
import { getEarnedBetween, getTotalEarned } from "@/database/incomeRepository";
import { useIncomes } from "@/hooks/useIncomes";
import { formatRupiah, formatTotalAmount } from "@/utils/format";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProgressBar } from 'rn-inkpad';
import { colors } from '../styles/global';
import BlinkingIcon from "./BlinkingIcon";

type SakuCardProps = {
  expenses: Expense[];
};

export default function SakuCard({ expenses }: SakuCardProps) {
  const { incomes } = useIncomes();
  const [monthOffset, setMonthOffset] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const rangeStart = viewDate.getTime();
  const rangeEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1).getTime();

  const numericIncome = incomes.reduce(
    (sum, i) => sum + (showAll ? getTotalEarned(i) : getEarnedBetween(i, rangeStart, rangeEnd)),
    0,
  );

  const numericExpense = expenses
    .filter(e => {
      const t = new Date(e.expenseDate).getTime();
      return showAll || (t >= rangeStart && t < rangeEnd);
    })
  .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = Math.max(0, numericIncome - numericExpense);
  const rawPercentage = numericIncome > 0 ? (numericExpense / numericIncome) * 100 : 0;
  const progressValue = Math.min(Math.max(rawPercentage, 0), 100);

  const NEAR_LIMIT = 80; // percent of income spent
  const isNearLimit = progressValue >= NEAR_LIMIT || (numericIncome === 0 && numericExpense > 0);

  const title = showAll
    ? 'All Budget'
    : viewDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

  const nextDisabled = showAll || monthOffset >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.rowCard}>
        <View style={styles.labelContainer}>
          <TouchableOpacity onPress={() => setShowAll(v => !v)}>
            <BlinkingIcon name="wallet" size={20} color={showAll ? colors.text : colors.header} />
          </TouchableOpacity>
          <Text style={styles.label}>{title}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity disabled={showAll} onPress={() => setMonthOffset(o => o - 1)}>
            <Entypo name="triangle-left" size={24} color={colors.textSecondary}
              style={{ opacity: showAll ? 0.6 : 1 }} />
          </TouchableOpacity>

          <TouchableOpacity disabled={nextDisabled} onPress={() => setMonthOffset(o => o + 1)}>
            <Entypo name="triangle-right" size={24} color={colors.textSecondary}
              style={{ opacity: nextDisabled ? 0.6 : 1 }} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.budget}>{formatRupiah(remainingBudget)}</Text>

      <View style={{ marginTop: 16 }}>
        <ProgressBar
            value={progressValue}
            rounded
            height={18}
            progressColor={isNearLimit ? colors.alert : colors.primary}
            backgroundColor={colors.background}
            textColor={colors.textSecondary}
          />
      </View>
      
      <View style={styles.rowCard}>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <Text style={[styles.expense, isNearLimit && { color: colors.alert }]}>
            {formatTotalAmount(numericExpense)}
          </Text>
          <Text style={styles.income}> of {formatTotalAmount(numericIncome)}</Text>
        </View>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.navigate('/income')}>
          <BlinkingIcon name="cash-edit" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingInline: 16,
    paddingVertical: 32,
    width: '100%',
    borderBottomWidth: 4,
    marginBottom: 20
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textSecondary,
    alignSelf: 'flex-start',
    gap: 8,
    borderRadius: 4,
    paddingInline: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: colors.header,
    fontWeight: 'bold'
  },
  budget: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  expense: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  income: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
});