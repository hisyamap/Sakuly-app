import SplashScreen from "@/components/SplashScreen";
import { useDataStore } from "@/store/useDataStore";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/global";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    useDataStore.getState().load();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          edges={['top']}
        >
          {isLoading ? (
            <SplashScreen />
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name='(tabs)' />
            </Stack>
          )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
