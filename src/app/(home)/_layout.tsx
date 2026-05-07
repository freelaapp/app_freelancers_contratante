import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/custom-tab-bar";

export default function HomeLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="vagas" />
      <Tabs.Screen name="criar-vaga" />
      <Tabs.Screen name="avaliacoes" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="notificacoes" options={{ href: null }} />
      <Tabs.Screen name="vaga" options={{ href: null }} />
      <Tabs.Screen name="meus-dados" options={{ href: null }} />
      <Tabs.Screen name="financeiro" options={{ href: null }} />
    </Tabs>
  );
}
