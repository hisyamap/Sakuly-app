import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../styles/global";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.header,
          borderTopColor: colors.surface,
          height: 60 + insets.bottom
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen 
        name='index'
        options={{
          title: 'My Saku',
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons name='wallet' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name='expense'
        options={{
          title: 'Expense',
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons name='cash-multiple' size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Income',
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons name="cash-plus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name='history'
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialDesignIcons name='view-list-outline' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
