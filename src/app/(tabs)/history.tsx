import ExpenseItem from '@/components/ExpenseItem';
import IncomeItem from '@/components/IncomeItem';
import { Expense } from '@/database/expenseRepository';
import { getEarnedBetween, Income } from '@/database/incomeRepository';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { colors, globalStyles } from '@/styles/global';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Menu, SegmentedButtons, Text } from 'react-native-paper';

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const [listHeight, setListHeight] = useState(0);
  const [value, setValue] = useState<'expense' | 'income'>('expense');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { tab } = useLocalSearchParams<{ tab?: string }>();

  const { expenses, remove: handleDeleteExpense } = useExpenses();
  const { incomes, remove: handleDeleteIncome } = useIncomes();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => {
    setMenuVisible(false);
    setCategoriesOpen(false);
  };

  const handleFilterSelect = (filterType: string) => {
    setSelectedFilter(filterType);
    closeMenu();
  };

  useFocusEffect(
    useCallback(() => {
      setValue(tab === 'income' ? 'income' : 'expense');
    }, [tab])
  );

  const itemHeight = 95;

  const sortedExpenses = [...expenses].sort(
    (a, b) =>
      new Date(b.expenseDate).getTime() -
      new Date(a.expenseDate).getTime()
  );

  const sortedIncomes = [...incomes].sort(
    (a, b) =>
      new Date(b.incomeDate || 0).getTime() -
      new Date(a.incomeDate || 0).getTime()
  );
  const getRange = (filter: string): [number, number] | null => {
  const n = new Date();
  const y = n.getFullYear();
  const m = n.getMonth();
    if (filter === 'this_month') return [new Date(y, m, 1).getTime(), new Date(y, m + 1, 1).getTime()];
    if (filter === 'last_month') return [new Date(y, m - 1, 1).getTime(), new Date(y, m, 1).getTime()];
    return null;
  };

  const range = getRange(selectedFilter);

  const inRange = (item: Expense | Income): boolean => {
    if (!range) return true;

    const [start, end] = range;
    if ('incomeDate' in item) {
      return !!item.incomeDate && getEarnedBetween(item, start, end) > 0;
    }

    const t = new Date(item.expenseDate).getTime();
    return t >= start && t < end;
  };

  const baseData: (Expense | Income)[] =
    value === 'expense' ? sortedExpenses : sortedIncomes;

  const categories = [...new Set(baseData.map(i => i.category))];

  const data = baseData.filter(
    i => inRange(i) && (selectedFilter !== 'category' || i.category === selectedCategory),
  );

  const pageSize = Math.max(
    1,
    Math.floor(listHeight / itemHeight)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / pageSize)
  );

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setSelectedFilter('all');
  }, [value]);

  useEffect(() => {
    setCurrentPage(1);
  }, [value, selectedFilter, selectedCategory]);

  return (
    <View style={[globalStyles.container, { flex: 1 }]}>
      <View style={ styles.headerContainer }>
        <SegmentedButtons
          value={value}
          onValueChange={setValue}
          style={styles.segmentedContainer}
          theme={{
            colors: {
              secondaryContainer: colors.textSecondary,
              onSecondaryContainer: colors.header,
              outline: colors.textSecondary,
              onSurface: colors.textSecondary,
            },
          }}
          buttons={[
            {
              value: 'expense',
              label: 'Expense',
              labelStyle: styles.label,
              style: styles.individualButton,
            },
            {
              value: 'income',
              label: 'Income',
              labelStyle: styles.label,
              style: styles.individualButton,
            },
          ]}
        />
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity style={styles.filterButton} onPress={openMenu} >
              <Feather name="filter" size={20} color={selectedFilter !== 'all' ? colors.text : colors.header} />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            onPress={() => handleFilterSelect('all')} 
            title="All Transactions" 
            leadingIcon={({ size }) => (
              <MaterialCommunityIcons
                name="format-list-bulleted" 
                size={size} 
                color={selectedFilter == 'all' ? colors.text : colors.header}
              />
            )}
            titleStyle={styles.menuItemText}
          />
          <Divider />
          <Menu.Item 
            onPress={() => handleFilterSelect('this_month')} 
            title="This Month" 
            leadingIcon={({ size }) => (
              <MaterialCommunityIcons 
                name="calendar-month" 
                size={size} 
                color={selectedFilter == 'this_month' ? colors.text : colors.header}
              />
            )}
            titleStyle={styles.menuItemText}
          />
          <Menu.Item 
            onPress={() => handleFilterSelect('last_month')} 
            title="Last Month" 
            leadingIcon={({ size }) => (
              <MaterialCommunityIcons 
                name="calendar-clock" 
                size={size} 
                color={selectedFilter == 'last_month' ? colors.text : colors.header}
              />
            )}
            titleStyle={styles.menuItemText}
          />
          <Divider />
          <Menu.Item
            title="By Category"
            onPress={() => setCategoriesOpen(open => !open)}
            leadingIcon={({ size }) => (
              <MaterialCommunityIcons
                name="shape-outline"
                size={size}
                color={selectedFilter === 'category' ? colors.text : colors.header}
              />
            )}
            trailingIcon={({ size }) => (
              <MaterialCommunityIcons
                name={categoriesOpen ? 'chevron-up' : 'chevron-down'}
                size={size}
                color={colors.header}
              />
            )}
            titleStyle={styles.menuItemText}
          />
          {categoriesOpen &&
            (categories.length === 0 ? (
              <Menu.Item title="No categories" disabled style={{ paddingLeft: 12 }} />
            ) : (
              categories.map(cat => (
                <Menu.Item
                  key={cat}
                  title={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    handleFilterSelect('category');
                  }}
                  titleStyle={[
                    styles.menuItemText,
                    selectedFilter === 'category' && selectedCategory === cat && { color: colors.text },
                  ]}
                  style={{ paddingLeft: 12 }}
                />
              ))
            ))
          }
        </Menu>
      </View>

      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          const newHeight = event.nativeEvent.layout.height;
          setListHeight((previous) =>
            previous === newHeight ? previous : newHeight
          );
        }}
      >
        <FlatList
          style={{ flex: 1 }}
          data={paginatedData}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            if (value === 'expense') {
              const expenseItem = item as Expense;

              return (
                <ExpenseItem
                  id={expenseItem.id}
                  name={expenseItem.name}
                  amount={expenseItem.amount}
                  category={expenseItem.category}
                  expenseDate={expenseItem.expenseDate}
                  onDelete={handleDeleteExpense}
                />
              );
            }

            const incomeItem = item as Income;

            return (
              <IncomeItem
                id={incomeItem.id}
                name={incomeItem.name}
                amount={incomeItem.amount}
                category={incomeItem.category}
                recurring={incomeItem.recurring ?? ''}
                incomeDate={incomeItem.incomeDate}
                onDelete={handleDeleteIncome}
              />
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>No {value === 'expense' ? 'expenses' : 'income'} found</Text>
            </View>
          }
        />

        <View style={styles.pagination}>
          <TouchableOpacity 
            disabled={currentPage === 1} 
            onPress={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            } 
            style={[ styles.arrow, currentPage === 1 && styles.arrowDisabled ]}
            >  
            <Ionicons name="arrow-back" size={20} color={currentPage === 1 ? colors.textSecondary : 'black'} /> 
          </TouchableOpacity> 

          <View style={ styles.pageNumber }>
            <Text style={[ styles.label, { color: colors.primary } ]}>
              {currentPage}
            </Text>
            <Text style={ styles.label }>of</Text>
            <Text style={ styles.label }>
              {totalPages}
            </Text>
          </View>

          <TouchableOpacity 
            disabled={currentPage >= totalPages} 
            onPress={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            } 
            style={[ styles.arrow, currentPage >= totalPages && styles.arrowDisabled ]}
            >  
            <Ionicons name="arrow-forward" size={20} color={currentPage >= totalPages ? colors.textSecondary : 'black'} /> 
          </TouchableOpacity> 
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16
  },
  segmentedContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 14
  },
  individualButton: {
    borderRadius: 8,
    padding: 1
  },
  filterButton: {
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, 
  },
  menuContent: {
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    marginTop: 48,
    paddingVertical: 2
  },
  menuItemText: {
    color: colors.header,
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  pageNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  arrow: {
    backgroundColor: colors.textSecondary, 
    borderRadius: 8, 
    padding: 4,
    marginInline: 8
  },
  arrowDisabled: {
    backgroundColor: colors.surface,      
  },
});