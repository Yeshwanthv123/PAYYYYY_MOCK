import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore user from localStorage (set by signIn/signUp)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        setUser(JSON.parse(raw) as User);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: new Error(data?.error || 'Signup failed') };

      const newUser = data.user ?? data.session?.user ?? null;
      if (newUser) {
        setUser(newUser);
        try {
          localStorage.setItem('auth_user', JSON.stringify(newUser));
        } catch {}
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: new Error(data?.error || 'Signin failed') };

      const newUser = data.user ?? data.session?.user ?? null;
      if (newUser) {
        setUser(newUser);
        try {
          localStorage.setItem('auth_user', JSON.stringify(newUser));
        } catch {}
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
    } catch {}
    // backend signout is not required for this flow (stateless token)
    return;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
