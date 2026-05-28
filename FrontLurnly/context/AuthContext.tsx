import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Definisikan tipe data yang benar
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  signIn: (newToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 2. Gunakan generic <string | null> agar TS tidak marah
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('user_token');
        setToken(savedToken);
      } catch (e) {
        console.error("Gagal load token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // 3. Gunakan 'string' (kecil), bukan 'String'
  const signIn = async (newToken: string) => {
    await AsyncStorage.setItem('user_token', newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}