import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { tokenStore } from "@/services/token-store";
import { registerUnauthorizedHandler, unregisterUnauthorizedHandler } from "@/services/api";
import { authService } from "@/services/auth.service";
import { toast } from "@/utils/toast";

type User = {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  contractorId?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await tokenStore.get();
        if (token) {
          const { data } = await authService.me();
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            profileCompleted: data.profileCompleted,
            contractorId: data.contractorId,
          });
        }
      } catch {
        await tokenStore.clear();
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      setUser(null);
    });
    return () => unregisterUnauthorizedHandler();
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    setIsLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      await tokenStore.set(data.accessToken);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        profileCompleted: data.user.profileCompleted,
        contractorId: data.user.contractorId,
      });
      toast.success("Login realizado com sucesso!");
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    await tokenStore.clear();
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
