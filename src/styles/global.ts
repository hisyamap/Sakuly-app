import { StyleSheet } from "react-native";

export const colors = {
  background: '#0B0F19',     
  header: '#111827',          
  surface: '#1F2937',        
  primary: '#0EA5E9',      
  text: '#F9FAFB',            
  textSecondary: '#9CA3AF',  
  alert: '#EF4444',           
};

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 30,
        marginBottom: 16,
    },
    empty: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})