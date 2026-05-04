import { BookingCard, HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useHomeVagas } from "@/hooks/useHomeVagas";
import { mapApiStatus, formatVagaValue } from "@/utils/vaga-status-map";
import type { VagaApi } from "@/types/vagas";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Helpers de mapeamento de campos da API ───────────────────────────────────

function formatApiDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatApiTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mn = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mn}`;
}

function resolveValue(item: Record<string, unknown>): number | undefined {
  // API retorna valores em centavos — preferência: chargeAmountInCents > payment > value
  const cents =
    (item.chargeAmountInCents as number | undefined) ??
    (item.payment as number | undefined) ??
    (item.totalAmountInCents as number | undefined);
  if (cents != null) return cents / 100;
  return item.value as number | undefined;
}

// ─── Subcomponentes definidos fora do render principal ────────────────────────

type EmptyStateProps = {
  onCreatePress: () => void;
};

function EmptyState({ onCreatePress }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma vaga cadastrada</Text>
      <Text style={styles.emptySubtext}>
        Crie sua primeira vaga para começar a contratar.
      </Text>
      <View style={styles.emptyButton}>
        <PrimaryButton label="Criar minha primeira vaga" onPress={onCreatePress} />
      </View>
    </View>
  );
}

type VagaSectionProps = {
  title: string;
  icon: string;
  vagas: VagaApi[];
  onPressVaga: (id: string) => void;
};

function VagaSection({ title, icon, vagas, onPressVaga }: VagaSectionProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} icon={icon} />
      <View style={styles.cardList}>
        {vagas.map((item) => (
          <BookingCard
            key={item.id}
            title={item.title}
            location={(item.location ?? item.address ?? "") as string}
            date={formatApiDate(item.date as string | undefined)}
            time={formatApiTime(item.startTime as string | undefined)}
            value={formatVagaValue(resolveValue(item))}
            status={mapApiStatus(item.status)}
            onPress={() => onPressVaga(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { vagas, loading, refreshing, onRefresh, fetchVagas } = useHomeVagas();

  useFocusEffect(
    useCallback(() => {
      fetchVagas();
    }, [fetchVagas])
  );

  const handleNavigateToCreateVaga = useCallback(() => {
    router.push("/(home)/criar-vaga");
  }, [router]);

  const handleNavigateToVaga = useCallback(
    (id: string) => {
      router.push(`/(home)/vaga/${id}`);
    },
    [router]
  );

  const handleNotifications = useCallback(() => {
    router.push("/(home)/notificacoes");
  }, [router]);

  const proximas = vagas.filter((v) =>
    ["confirmado", "aguardando"].includes(mapApiStatus(v.status))
  );

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={user?.name ?? "Usuário"}
        onNotifications={handleNotifications}
      />
      <ScrollView
        testID="home-scroll-view"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <PrimaryButton label="Criar Vaga" onPress={handleNavigateToCreateVaga} />

        {loading ? (
          <ActivityIndicator
            testID="home-loading"
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : vagas.length === 0 ? (
          <EmptyState onCreatePress={handleNavigateToCreateVaga} />
        ) : (
          <>
            {proximas.length > 0 && (
              <VagaSection
                title="Próximas Contratações"
                icon="time-outline"
                vagas={proximas}
                onPressVaga={handleNavigateToVaga}
              />
            )}
            <VagaSection
              title="Minhas Vagas"
              icon="flash"
              vagas={vagas}
              onPressVaga={handleNavigateToVaga}
            />
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
  emptyButton: {
    width: "100%",
    marginTop: spacing["8"],
  },
  section: {
    marginTop: spacing["12"],
    gap: spacing["6"],
  },
  cardList: {
    gap: spacing["4"],
  },
});
