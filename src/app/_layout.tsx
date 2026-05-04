import { AppSplash } from "@/components/app-splash";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { NotificationsProvider } from "@/context/notifications-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function ToastWithInsets() {
  const { top } = useSafeAreaInsets();
  return <Toast topOffset={top + 12} />;
}

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <NotificationsProvider>
          <RootNavigator />
        </NotificationsProvider>
      </AuthProvider>
      <ToastWithInsets />
    </>
  );
}
