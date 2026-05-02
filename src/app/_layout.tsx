import { AppSplash } from "@/components/app-splash";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

function RootNavigator() {
  const { user, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const currentScreen = segments[1] as string | undefined;
    const inCompletarCadastro = currentScreen === "completar-cadastro";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && !user.profileCompleted && inAuthGroup && !inCompletarCadastro) {
      router.replace("/(auth)/completar-cadastro");
    } else if (user && user.profileCompleted && inAuthGroup) {
      router.replace("/(home)");
    } else if (user && !user.profileCompleted && !inAuthGroup) {
      router.replace("/(auth)/completar-cadastro");
    }
  }, [user, isInitializing, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(home)" />
        <Stack.Screen name="index" />
      </Stack>

      {splashVisible && (
        <AppSplash
          isReady={!isInitializing}
          onFinish={() => setSplashVisible(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <Toast />
    </>
  );
}
