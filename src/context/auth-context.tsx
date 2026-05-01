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
          // /me retorna o perfil (name, avatarUrl) mas não email nem profileCompleted
          // Usar refresh token para obter sessão completa é o ideal futuro
          // Por ora (token em memória, Expo Go): restaura o mínimo viável
          const { data } = await authService.me();
          console.log("[AUTH] me response:", JSON.stringify(data, null, 2));
          setUser({
            id: data.userId ?? data.id ?? "",
            name: data.name ?? "",
            email: "",
            profileCompleted: true, // se há token salvo, onboarding já foi concluído
            contractorId: undefined,
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
    console.log("[AUTH] signIn iniciado:", email);
    setIsLoading(true);
    try {
      // Com o interceptor de envelope, data já é o payload desembrulhado
      // { accessToken, refreshToken, user, onboarding, context }
      const { data } = await authService.login({ email, password });
      console.log("[AUTH] login response:", JSON.stringify(data, null, 2));

      await tokenStore.set(data.accessToken);

      // onboarding.isPending = true → usuário novo, redirecionar para onboarding
      const profileCompleted = !data.onboarding.isPending;

      // contractorId só existe no context após completar onboarding
      const moduleProfile = data.context?.profilesByModule?.["bars-restaurants"];
      const contractorId = moduleProfile?.contractorId;

      // /me retorna name mas não retorna email/profileCompleted — usa dados do login para esses
      let name = "";
      try {
        const { data: meData } = await authService.me();
        console.log("[AUTH] me response:", JSON.stringify(meData, null, 2));
        name = meData.name ?? "";
      } catch {
        // /me falhou — sem nome por enquanto
      }

      setUser({
        id: data.user.id,
        name,
        email: data.user.email,
        profileCompleted,
        contractorId,
      });

      toast.success("Login realizado com sucesso!");
    } catch (err) {
      console.log("[AUTH] signIn erro:", err);
      throw err;
    } finally {
      console.log("[AUTH] signIn finalizado");
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
