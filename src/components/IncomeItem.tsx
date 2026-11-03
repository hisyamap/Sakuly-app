import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { colors } from '../styles/global';

type IncomeItemProps = {
  id: string;
  name: string;
  amount: number;
  category: string;
  incomeDate: number;
  recurring: string;
  onDelete: (id: string) => void;
};

export default function IncomeItem({
  id,
  name,
  amount,
  category,
  incomeDate,
  recurring,
  onDelete,
}: IncomeItemProps) {
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
          <Text style={styles.amount}>Rp {amount.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.rowCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.macros}>
              {category} -{' '}
              {incomeDate
                ? new Date(incomeDate).toLocaleDateString('id-ID')
                : ''}
            </Text>

            {typeof recurring === 'string' &&
              recurring !== '' &&
              recurring !== 'none' ? (
                <View style={ styles.recurringContainer }>
                  <MaterialCommunityIcons 
                    name="calendar-clock-outline"
                    size={16}
                    color={colors.primary}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={styles.recurringText}>
                    {`Repeats ${recurring.toLowerCase()}`}
                  </Text>
                </View>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => setShowDeleteDialog(true)}>
            <Feather
              color={colors.textSecondary}
              name="trash-2"
              size={20}
              style={{ marginTop: 4, opacity: 0.6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Portal> 
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)} style={styles.dialog}> 
          <Dialog.Title>
            <Text style={{ color: colors.textSecondary }}>Delete Income</Text>
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
            <Button onPress={() => setShowDeleteDialog(false)} > Cancel </Button> 
            <Button onPress={handleDelete} > Delete </Button> 
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
  recurringContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4,
    gap: 8
  },
  recurringText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary 
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