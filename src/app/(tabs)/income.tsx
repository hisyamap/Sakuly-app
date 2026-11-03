import IncomeItem from '@/components/IncomeItem';
import { addIncome, RECCURING, Recurring } from '@/database/incomeRepository';
import { useIncomes } from '@/hooks/useIncomes';
import { useRecentItems } from '@/hooks/useRecentItems';
import { colors, globalStyles } from '@/styles/global';
import { formatDateDisplay, formatRupiah, maskDateInput, parseInputToDate } from '@/utils/format';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ActivityIndicator, Button, Checkbox, Dialog, Portal } from 'react-native-paper';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';

registerTranslation('en', en);

const CATEGORIES = [
  { label: 'Salary', value: 'Salary' },
  { label: 'Freelance', value: 'Freelance' },
  { label: 'Investment', value: 'Investment' },
];

export default function AddIncomeScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [recurring, setRecurring] = useState<Recurring>('');

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputText, setDateInputText] = useState(formatDateDisplay(new Date()));
  const [openDatePicker, setOpenDatePicker] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const [dialog, setDialog] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'error' | 'success',
  });

  const { incomes, reload: loadIncomes, remove: handleDeleteIncome, totalIncomes } = useIncomes();

  const onDismiss = () => {
    setOpenDatePicker(false);
  };

  const onConfirm = (params: { date?: Date }) => {
    setOpenDatePicker(false);
    if (params.date) {
      setSelectedDate(params.date);
      setDateInputText(formatDateDisplay(params.date));
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');

    setAmount(numericValue);
  };

  const convertToRupiah = (value: string) => {
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) {
      return '';
    }

    return `Rp ${Number(numericValue).toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    formatRupiah(totalIncomes(incomes))
  }, [incomes]);

  const showErrorDialog = (message: string) => {
    setDialog({
      visible: true,
      title: 'Error',
      message,
      type: 'error',
    });
  };

  const showSuccessDialog = (message: string) => {
    setDialog({
      visible: true,
      title: 'Success',
      message,
      type: 'success',
    });
  };

  const hideDialog = () => {
    setDialog((current) => ({
      ...current,
      visible: false,
    }));
  };

  const handleAddIncome = async () => {
    if (!name.trim()) {
      showErrorDialog('Please enter an income name.');
      return;
    }

    const numericAmount = Number(amount);

    if (!amount.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      showErrorDialog('Please enter a valid income amount.');
      return;
    }

    if (!category) {
      showErrorDialog('Please select a category.');
      return;
    }

    try {
      setIsSubmitting(true);

      await addIncome(
        name.trim(),
        numericAmount,
        category,
        selectedDate.getTime(),
        recurring
      );

      showSuccessDialog('Income added successfully.');

      setName('');
      setAmount('');
      setCategory('');
      setSelectedDate(new Date());
      setRecurring('');
      loadIncomes();

    } catch (error) {
      console.error('Failed to add income:', error);

      showErrorDialog(
        'Something went wrong while saving the income.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const recentIncomes = useRecentItems(
    incomes,
    e => new Date(e.incomeDate).getTime(),
    550, // Add income form height
  );

  const toggleRecurring = () => {
    setIsRecurring((previous) => {
      if (previous) {
        setCategory('');
      }

      return !previous;
    });
  };

  const handleDateTextChange = (text: string) => {
    setDateInputText(maskDateInput(text));
  };

  const handleDateInputBlur = () => {
    const parsedDate = parseInputToDate(dateInputText);
    if (parsedDate) {
      setSelectedDate(parsedDate);
      setDateInputText(formatDateDisplay(parsedDate));
    } else {
      setDateInputText(formatDateDisplay(selectedDate));
    }
  };
  return (
    <>
      <FlatList
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      data={recentIncomes}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <View style={ styles.titleContainer }>
              <Text style={styles.title}>Income</Text>
              <Text style={styles.totalIncome}>{formatRupiah(totalIncomes(incomes))}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={30}
          />

          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={convertToRupiah(amount)}
            onChangeText={handleAmountChange}
            maxLength={14}
          />

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownMenuContainer}
            activeColor={colors.textSecondary}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemTextStyle}
            data={CATEGORIES}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={category}
            onChange={(item) => setCategory(item.value)}
          />

          <View style={styles.bottomContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              value={dateInputText}
              onChangeText={handleDateTextChange}
              onBlur={handleDateInputBlur}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#a0a0b0"
              keyboardType="numeric"
              maxLength={10}
            />
            <TouchableOpacity style={styles.dateButton} onPress={() => setOpenDatePicker(true)}>
              <FontAwesome6 name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <DatePickerModal
              locale="en"
              mode="single"
              visible={openDatePicker}
              onDismiss={onDismiss}
              date={selectedDate}
              onConfirm={onConfirm}
            />
            {isRecurring ? (
              <Dropdown
                style={[styles.dropdown, { flex: 1, marginInline: 8 }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor={colors.textSecondary}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                data={RECCURING}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={category}
                onChange={(item) => {
                  if (
                    item.label === 'Cancel'
                  ) {
                    setIsRecurring(false);
                    setRecurring
                    return;
                  }
                  setRecurring(item.value)
                }}
              />
            ) : (
              <View style={{ marginTop: 16 }}>
                <Checkbox.Item
                  label="Recurring"
                  status={isRecurring ? 'checked' : 'unchecked'}
                  onPress={toggleRecurring}
                  color={colors.primary}
                  uncheckedColor={colors.textSecondary}
                  position="trailing"
                  style={styles.checkbox}
                  labelStyle={styles.checkboxLabel}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleAddIncome}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <FontAwesome6 name="check" size={24} color="black" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Recent Incomes</Text>
        </View>
      }
      renderItem={({ item }) => (
        <IncomeItem
          id={item.id}
          name={item.name}
          amount={item.amount}
          category={item.category}
          recurring={item.recurring ?? ''}
          incomeDate={item.incomeDate}
          onDelete={handleDeleteIncome}
        />
      )}
      ListEmptyComponent={
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>No income found</Text>
        </View>
      }
      ListFooterComponent={() =>
        recentIncomes.length > 0 ? (
          <View style={styles.viewAllContainer}>
            <Pressable
              style={styles.viewAllButton}
              onPress={() => router.push('/history?tab=income')}
            >
              <Text style={styles.viewAllText}>View All Incomes</Text>
            </Pressable>
          </View>
        ) : null
      }
    />

      <Portal>
        <Dialog
          visible={dialog.visible}
          onDismiss={hideDialog}
          style={styles.dialog}
        >
          <Dialog.Title>
            <Text style={{ color: colors.textSecondary }}>
              {dialog.title}
            </Text>
          </Dialog.Title>

          <Dialog.Content>
            <Text style={{ color: colors.text }}>
              {dialog.message}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={hideDialog}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalIncome: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.header,
    backgroundColor: colors.textSecondary, 
    borderRadius: 4,
    paddingInline: 8,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: 16,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  dropdown: {
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingInline: 16,
    marginTop: 16
  },
  dropdownMenuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,    
    borderColor: colors.surface,
    overflow: 'hidden',           
  },
  placeholderStyle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '400'
  },
  itemTextStyle: {
    fontSize: 16,
    color: colors.text
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderBottomWidth: 4,
    width: '85%',
    maxWidth: 360,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',     
  },
  dateInput: {
    flex: 1,
    paddingRight: 0,
    fontSize: 14,
    fontWeight: 600,
    width: 90,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,      
  },
  dateButton: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    marginTop: 16,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10
  },
  checkbox: {
    paddingLeft: 8, 
    paddingRight: 0,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
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
});