import React, { createContext, useContext, useEffect } from 'react';
import { User } from '../types';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useCacheManagement } from '@/hooks/useCacheManagement';
import { monitorTokenRefresh, checkTokenStatus, manualTokenRefresh } from '@/utils/authUtils';

interface TokenStatus {
  hasValidToken: boolean;
  error?: string | Error;
  session?: any;
  expiresAt?: number;
  timeUntilExpiry?: number;
  hasRefreshToken?: boolean;
}

interface TokenRefreshResult {
  success: boolean;
  error?: string | Error;
  session?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  clearCacheAndReload: () => void;
  makeUserAdmin: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword?: string) => Promise<void>;
  checkTokenStatus: () => Promise<TokenStatus>;
  manualTokenRefresh: () => Promise<TokenRefreshResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, loading, setLoading } = useAuthState();
  const { login, signup, signInWithGoogle, logout, updateProfile, addFunds, makeUserAdmin, resetPassword } = 
    useAuthActions(user, setUser, setLoading);
  const { clearCacheAndReload } = useCacheManagement();

  useEffect(() => {
    console.log('🔧 Initializing token refresh monitoring...');
    monitorTokenRefresh();
    
    checkTokenStatus().then(status => {
      if (status.hasValidToken) {
        console.log('✅ Initial token check passed');
      } else {
        console.log('⚠️ Initial token check failed or no session');
      }
    });
    
    const tokenCheckInterval = setInterval(async () => {
      if (user) {
        const status = await checkTokenStatus();
        if (!status.hasValidToken && status.hasRefreshToken) {
          console.log('🔄 Token expired but refresh token available, Supabase should auto-refresh');
        }
      }
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      signInWithGoogle, 
      logout, 
      updateProfile, 
      addFunds,
      clearCacheAndReload,
      makeUserAdmin,
      resetPassword,
      checkTokenStatus,
      manualTokenRefresh
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
