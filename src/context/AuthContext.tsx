import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserData {
  id: string;
  nombres: string;
  celular: string;
  edad: number;
  email: string;
  role: 'admin' | 'voluntario';
  created_at?: string;
}

// Para no romper otras partes de la app que esperan "uid", lo agregamos al tipo
export type AppUser = SupabaseUser & { uid: string };

interface AuthContextType {
  user: AppUser | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombres: string, celular: string, edad: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user;
      if (currentUser) {
        const appUser = { ...currentUser, uid: currentUser.id } as AppUser;
        setUser(appUser);
        fetchUserData(appUser.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        const appUser = { ...currentUser, uid: currentUser.id } as AppUser;
        setUser(appUser);
        await fetchUserData(appUser.id);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data && !error) {
        setUserData(data as UserData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, nombres: string, celular: string, edad: number) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('Error al crear usuario.');

    const newUserData: UserData = {
      id: data.user.id,
      nombres,
      celular,
      edad,
      email,
      role: 'voluntario',
      created_at: new Date().toISOString()
    };

    // Save extra data to Supabase table
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([newUserData]);
      
    if (dbError) throw dbError;
    
    setUserData(newUserData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, logout }}>
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
