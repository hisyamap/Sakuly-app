import { addExpense } from '@/database/expenseRepository';
import { useExpenses } from '@/hooks/useExpenses';
import { formatDateDisplay, formatTotalAmount, maskDateInput, parseInputToDate } from '@/utils/format';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Dialog, Portal } from 'react-native-paper';
import { DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';
import { colors, globalStyles } from '../../styles/global';

registerTranslation('en', en);

const CATEGORIES = [
  { label: 'Food & Drinks', value: 'Food' },
  { label: 'Transportation', value: 'Transport' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Bills & Utilities', value: 'Bills' },
  { label: 'Entertainment', value: 'Entertainment' },
];

export default function AddExpenseScreen() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputText, setDateInputText] = useState(formatDateDisplay(new Date()));
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as 'error' | 'success',
  });

  const { reload: loadExpenses, totalExpenses } = useExpenses();
  
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

  const convertToRupiah = (value: string) => {
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) {
      return '';
    }

    return `Rp ${Number(numericValue).toLocaleString('id-ID')}`;
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');

    setAmount(numericValue);
  };

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

  const handleAddExpense = async () => {
    if (!name.trim()) {
      showErrorDialog('Please enter an expense name.');
      return;
    }

    const numericAmount = Number(amount);

    if (!amount.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      showErrorDialog('Please enter a valid expense amount.');
      return;
    }

    if (!category) {
      showErrorDialog('Please select a category.');
      return;
    }

    try {
      setIsSubmitting(true);

      await addExpense(
        name.trim(),
        numericAmount,
        category,
        selectedDate.getTime(),
      );

      showSuccessDialog('Expense added successfully.');

      setName('');
      setAmount('');
      setCategory('');
      setSelectedDate(new Date());
      loadExpenses();

    } catch (error) {
      console.error('Failed to add expense:', error);

      showErrorDialog(
        'Something went wrong while saving the expense.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateTextChange = (text: string) => {
    setDateInputText(maskDateInput(text))
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
      <View style={[ globalStyles.container, {flex: 1, justifyContent: 'center'} ]}>
        <View style={ styles.titleContainer }>
          <Text style={styles.title}>Expense</Text>
          <Text style={styles.totalExpense}>{formatTotalAmount(totalExpenses)}</Text>
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

        <View style={styles.dateContainer}>
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
            <Feather name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={openDatePicker}
          onDismiss={onDismiss}
          date={selectedDate}
          onConfirm={onConfirm}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Dialog
          visible={dialog.visible}
          onDismiss={hideDialog}
          style={styles.dialog}
        >
          <Dialog.Title>
            <Text style={ styles.dialogTitle }>
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
               <Text style={{ color: colors.primary }}>Okay</Text>
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
  totalExpense: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.header,
    backgroundColor: colors.textSecondary, 
    borderRadius: 4,
    paddingInline: 8,
    paddingVertical: 4,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  dropdown: {
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    height: 50,
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingInline: 16,
    marginTop: 16,
  },
  dropdownMenuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,    
    borderColor: colors.surface,
    overflow: 'hidden',     
    marginTop: 4,       
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
  },
  dateButton: {
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
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
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
});