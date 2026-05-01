import { HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

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
