import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleGoogleRedirect } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';

interface AuthUser {
  id: number;
  name: string;
  email?: string;
  username?: string;
  phone: string;
  vehicleNumber: string;
  authProvider: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  loginWithFirebase: (firebaseUser: User, vehicleNumber: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken) {
          const response = await apiRequest('/api/auth/verify-session', {
            method: 'POST',
            headers: { Authorization: `Bearer ${sessionToken}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            localStorage.removeItem('sessionToken');
          }
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        localStorage.removeItem('sessionToken');
      }
      setIsLoading(false);
    };

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (!firebaseUser) {
        checkSession();
      }
    });

    // Handle Google redirect result
    handleGoogleRedirect().then((result) => {
      if (result?.user) {
        // User came back from Google sign-in, but we need vehicle info
        // This will be handled by the auth components
      }
    }).catch((error) => {
      console.error('Google redirect error:', error);
    });

    checkSession();

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('sessionToken', data.sessionToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('sessionToken', data.sessionToken);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFirebase = async (firebaseUser: User, vehicleNumber: string) => {
    setIsLoading(true);
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const response = await apiRequest('/api/auth/firebase-login', {
        method: 'POST',
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          vehicleNumber,
          idToken
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Firebase login failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('sessionToken', data.sessionToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('sessionToken');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      isLoading,
      login,
      register,
      loginWithFirebase,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}