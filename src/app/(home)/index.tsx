import { BookingCard, HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { vagasService } from "@/services/vagas.service";
import type { VagaApi } from "@/types/vagas";
import { mapApiStatus, formatVagaValue } from "@/utils/vaga-status-map";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vagas, setVagas] = useState<VagaApi[]>([]);

  useEffect(() => {
    if (!user) return;
    const contractorId = user.contractorId ?? user.id;
    vagasService
      .listByContractor(contractorId)
      .then(setVagas)
      .finally(() => setLoading(false));
  }, [user]);

  const proximas = vagas.filter((v) =>
    ["confirmado", "aguardando"].includes(mapApiStatus(v.status))
  );

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

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : vagas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma vaga cadastrada</Text>
            <Text style={styles.emptySubtext}>
              Crie sua primeira vaga para começar a contratar.
            </Text>
          </View>
        ) : (
          <>
            {proximas.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Próximas Contratações" icon="time-outline" />
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  style={styles.sectionScroll}
                  contentContainerStyle={styles.cardList}
                >
                  {proximas.map((item) => (
                    <BookingCard
                      key={item.id}
                      title={item.title}
                      location={item.location ?? ""}
                      date={item.date ?? ""}
                      time={item.startTime ?? ""}
                      value={formatVagaValue(item.value as number | undefined)}
                      status={mapApiStatus(item.status)}
                      onPress={() => router.push(`/(home)/vaga/${item.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <SectionHeader title="Minhas Vagas" icon="flash" />
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.sectionScroll}
                contentContainerStyle={styles.cardList}
              >
                {vagas.map((item) => (
                  <BookingCard
                    key={item.id}
                    title={item.title}
                    location={item.location ?? ""}
                    date={item.date ?? ""}
                    time={item.startTime ?? ""}
                    value={formatVagaValue(item.value as number | undefined)}
                    status={mapApiStatus(item.status)}
                    onPress={() => router.push(`/(home)/vaga/${item.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}
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
  loader: {
    marginTop: spacing["16"],
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: spacing["16"],
    gap: spacing["4"],
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  emptySubtext: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
  },
  section: {
    marginTop: spacing["12"],
    gap: spacing["6"],
  },
  sectionScroll: {
    maxHeight: 300,
  },
  cardList: {
    gap: spacing["4"],
  },
});
