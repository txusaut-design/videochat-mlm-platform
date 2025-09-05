'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthProviderProps {
  children: ReactNode;
}

const publicRoutes = ['/', '/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, token, isAuthenticated, setUser, setToken, logout, isLoading, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        try {
          setLoading(true);
          const { user: userData } = await authApi.me();
          setUser(userData);
        } catch (error) {
          logout();
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [token, user, setUser, logout, setLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}