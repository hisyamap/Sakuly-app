import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { colors } from '../styles/global';

type ExpenseItemProps = {
  id: string;
  name: string;
  amount: number;
  category: string;
  expenseDate: number;
  onDelete: (id: string) => void;
};

export default function ExpenseItem({
  id,
  name,
  amount,
  category,
  expenseDate,
  onDelete,
}: ExpenseItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => { 
    setShowDeleteDialog(false); 
    onDelete(id);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.amount} numberOfLines={1}>
            Rp {amount.toLocaleString('id-ID')}
          </Text>
        </View>
        <View style={ styles.rowCard }>
          <Text style={styles.macros}>
            {category} - {new Date(expenseDate).toLocaleDateString('id-ID')}
          </Text>
          <TouchableOpacity onPress={() => setShowDeleteDialog(true)} > 
            <Feather color={colors.textSecondary} name="trash-2" size={20} style={{ marginTop: 4, opacity: 0.6 }}/> 
          </TouchableOpacity> 
        </View>
      </View>

      <Portal> 
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)} style={styles.dialog}> 
          <Dialog.Title>
            <Text style={ styles.dialogTitle }>Delete Expense</Text>
          </Dialog.Title> 
          <Dialog.Content> 
            <Text style={{ color: colors.text }}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {name}
              </Text>
              ?
            </Text>
          </Dialog.Content> 
          <Dialog.Actions> 
            <Button onPress={() => setShowDeleteDialog(false)} > 
              <Text style={{ color: colors.textSecondary }}>Cancel</Text> 
            </Button> 
            <Button onPress={handleDelete}>
              <Text style={{ color: colors.primary }}>Delete</Text>
            </Button> 
          </Dialog.Actions> 
        </Dialog> 
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  rowCard : {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  macros: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },

  dialog: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderBottomWidth: 4,
    width: '80%',
    maxWidth: 360,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});