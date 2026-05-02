import { HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth.service";
import { contractorService } from "@/services/contractor.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchUserData() {
      setIsLoadingData(true);
      try {
        console.log("[HOME] contexto local do usuário:", JSON.stringify(user, null, 2));

        const profileRes = await authService.getProfile();
        console.log("[HOME] perfil usuário (banco):", JSON.stringify(profileRes.data, null, 2));

        const contractorId = user?.contractorId;
        const module = user?.module;

        if (contractorId && module) {
          const contractorRes =
            module === "home-services"
              ? await contractorService.getCasaById(contractorId)
              : await contractorService.getBarsById(contractorId);
          console.log("[HOME] perfil contractor (banco):", JSON.stringify(contractorRes.data, null, 2));
        } else {
          console.log("[HOME] contractorId não encontrado no contexto — faça logout e login novamente para sincronizar");
        }
      } catch (err) {
        console.warn("[HOME] erro ao buscar dados:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchUserData();
  }, [user?.contractorId, user?.module]);

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={user?.name ?? "Usuário"}
        onNotifications={() => router.push("/(home)/notificacoes")}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PrimaryButton
          label="Criar Vaga"
          onPress={() => router.push("/(home)/criar-vaga")}
        />

        <View style={styles.section}>
          <SectionHeader title="Próximas Contratações" icon="time-outline" />
          <Text style={styles.emptyText}>Nenhuma contratação agendada</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Minhas Vagas" icon="flash" />
          <Text style={styles.emptyText}>Você ainda não criou nenhuma vaga</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["10"],
    paddingBottom: spacing["12"],
  },
  section: {
    marginTop: spacing["12"],
    gap: spacing["6"],
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    fontWeight: fontWeights.medium,
    textAlign: "center",
    paddingVertical: spacing["8"],
  },
});
