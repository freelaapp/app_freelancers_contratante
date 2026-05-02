import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { tokenStore } from "@/services/token-store";
import { registerUnauthorizedHandler, unregisterUnauthorizedHandler } from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  userType: "contractor" | "provider" | null;
  module: "home-services" | "bars-restaurants" | null;
  contractorId: string | null;
  avatarUrl: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  completeProfile: (module: "home-services" | "bars-restaurants", contractorId: string) => void;
  updateAvatar: (avatarUrl: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [token, storedUser] = await Promise.all([
          tokenStore.get(),
          tokenStore.getUser<User>(),
        ]);
        if (token && storedUser) {
          // se tem module mas não tem contractorId, sessão está desatualizada — força novo login
          if (storedUser.module && !storedUser.contractorId) {
            console.warn("[AUTH] sessão desatualizada: contractorId ausente — limpando para novo login");
            await tokenStore.clear();
          } else {
            setUser(storedUser);
          }
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
      const loginRes = await authService.login(email, password);
      const { accessToken, refreshToken, user: apiUser, onboarding, context } = loginRes.data;
      console.log("[AUTH] login response:", JSON.stringify({ user: apiUser, onboarding, context }, null, 2));

      await tokenStore.set(accessToken, refreshToken);

      let name = email;
      let avatarUrl: string | null = null;
      if (!onboarding.isPending) {
        try {
          const profileRes = await authService.getProfile();
          name = profileRes.data.name ?? email;
          avatarUrl = profileRes.data.avatarUrl ?? null;
        } catch {
          // best-effort — fallback to email
        }
      }

      const firstModule = context?.modules?.[0];
      const resolvedModule: User["module"] =
        firstModule === "home-services" || firstModule === "bars-restaurants"
          ? firstModule
          : null;

      const moduleProfile = firstModule ? context?.profilesByModule?.[firstModule] : null;
      const contractorId = moduleProfile?.contractorId ?? null;

      const newUser: User = {
        id: apiUser.id,
        name,
        email: apiUser.email,
        profileCompleted: !onboarding.isPending,
        userType: apiUser.userType as "contractor" | "provider" | null,
        module: resolvedModule,
        contractorId,
        avatarUrl,
      };

      console.log("[AUTH] contexto resolvido:", JSON.stringify({ module: resolvedModule, contractorId }, null, 2));
      await tokenStore.setUser(newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    await tokenStore.clear();
    setUser(null);
  }

  function completeProfile(module: "home-services" | "bars-restaurants", contractorId: string): void {
    if (!user) return;
    const updated: User = { ...user, profileCompleted: true, userType: "contractor", module, contractorId, avatarUrl: user.avatarUrl };
    tokenStore.setUser(updated);
    setUser(updated);
  }

  function updateAvatar(avatarUrl: string): void {
    if (!user) return;
    const updated: User = { ...user, avatarUrl };
    tokenStore.setUser(updated);
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, signIn, signOut, completeProfile, updateAvatar }}>
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
