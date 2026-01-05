

import { AuthProvider, useAuth } from '@/lib/auth-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider as PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message';

// Separate RootNavigator so we can access the AuthContext
function RootNavigator() {
  const { isLoggedIn, isReady } = useAuth();
  return (

    <Stack  >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen options={{ headerShown: false }} name="(tabs)" />
        <Stack.Screen name="create" options={{ headerShown: false }} />
        <Stack.Screen name="add-progress" options={{
          headerShown: false
        }} />
        <Stack.Screen options={{ headerShown: false }} name="result" />
        <Stack.Screen options={{ headerShown: false }} name="detail/[id]" />
        <Stack.Screen options={{ headerShown: false }} name="edit/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen options={{ headerShown: false }} name="login" />
        <Stack.Screen options={{ headerShown: false }} name="register" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {

  // const queryClient = new QueryClient()

  const queryClient = new QueryClient()

  return (
    <GestureHandlerRootView>
      <AuthProvider>

        <PaperProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>


              <RootNavigator />
              <Toast />
              <StatusBar style="auto" />
            </QueryClientProvider>
          </SafeAreaProvider>
        </PaperProvider>

      </AuthProvider>

    </GestureHandlerRootView>
  )
}