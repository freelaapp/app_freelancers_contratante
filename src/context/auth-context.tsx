import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  completeProfile: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  async function signIn(email: string, _password: string): Promise<void> {
    setIsLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    setUser({ id: "1", name: "Usuário Teste", email, profileCompleted: false });
    setIsLoading(false);
  }

  function signOut(): void {
    setUser(null);
  }

  function completeProfile(): void {
    if (user) setUser({ ...user, profileCompleted: true });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, signIn, signOut, completeProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
