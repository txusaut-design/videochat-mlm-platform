// src/app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/components/auth/AuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// src/components/auth/AuthProvider.tsx
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
          console.error('Auth initialization failed:', error);
          logout();
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [token, user, setUser, logout, setLoading]);

  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname);
    
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, pathname, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return <>{children}</>;
}