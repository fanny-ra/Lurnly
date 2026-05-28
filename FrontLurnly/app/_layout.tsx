import { AuthProvider } from '@/context/AuthContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true }}>
        {/* Definisikan semua halaman kamu di sini */}
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        {/* <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} /> */}
      </Stack>
    </AuthProvider>
  );
}