import { Ionicons } from "@expo/vector-icons";
import { BookingCard, HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";
import { useHomeVagas } from "@/hooks/useHomeVagas";
import { summaryService, ContractorSummary } from "@/services/summary.service";
import { mapApiStatus, formatVagaValue, resolveApiMoneyToReais } from "@/utils/vaga-status-map";
import { consumePendingVaga } from "@/utils/pending-vaga-store";
import type { VagaApi } from "@/types/vagas";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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

function isHojeOuFuturo(dateField?: string): boolean {
  if (!dateField) return true;
  const d = new Date(dateField);
  if (isNaN(d.getTime())) return true;
  const hoje = new Date();
  const vagaDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const hojeDay = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return vagaDay >= hojeDay;
}

function formatSaldo(s: ContractorSummary): string {
  const cents = s.currentMonthSpent ?? s.totalSpent;
  if (cents == null) return "R$ 0,00";
  const val = cents / 100;
  const intPart = Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = Math.round((val % 1) * 100).toString().padStart(2, "0");
  return `R$ ${intPart},${decPart}`;
}

function formatAvaliacao(s: ContractorSummary): string {
  const r = s.averageRating ?? s.rating;
  if (r == null) return "—";
  return r.toFixed(1);
}

// ─── Subcomponentes definidos fora do render principal ────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhuma vaga cadastrada</Text>
      <Text style={styles.emptySubtext}>
        Crie sua primeira vaga para começar a contratar.
      </Text>
    </View>
  );
}

type VagaSectionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
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
            value={formatVagaValue(resolveApiMoneyToReais(item))}
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
  const { hasUnread } = useNotifications();
  const router = useRouter();
  const { vagas, loading, refreshing, onRefresh, fetchVagas, addVaga } = useHomeVagas();
  const [summary, setSummary] = useState<ContractorSummary>({});

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingVaga();
      if (pending) addVaga(pending);
      fetchVagas();
      summaryService.getContractorSummary().then(setSummary).catch(() => {});
    }, [fetchVagas, addVaga])
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

  const handleHelp = useCallback(() => {
    Linking.openURL("https://wa.me/5511994989805?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20Freela%20Serviços.");
  }, []);

  const vagasHome = vagas.filter((v) => isHojeOuFuturo(v.date as string | undefined));
  const abertas = vagasHome.filter((v) => mapApiStatus(v.status) === "aberta");
  const concluidas = vagasHome.filter((v) => mapApiStatus(v.status) === "concluida");

  return (
    <View style={styles.container}>
      <HomeHeader
        userName={user?.name ?? "Usuário"}
        saldo={formatSaldo(summary)}
        vagas={summary.vacanciesCount ?? summary.totalVacancies ?? vagas.length}
        avaliacao={formatAvaliacao(summary)}
        hasNotifications={hasUnread}
        onNotifications={handleNotifications}
        onHelp={handleHelp}
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
        ) : vagasHome.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {abertas.length > 0 && (
              <VagaSection
                title="Aberta"
                icon="time-outline"
                vagas={abertas}
                onPressVaga={handleNavigateToVaga}
              />
            )}
            {concluidas.length > 0 && (
              <VagaSection
                title="Concluídas"
                icon="checkmark-circle-outline"
                vagas={concluidas}
                onPressVaga={handleNavigateToVaga}
              />
            )}
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
  cardList: {
    gap: spacing["4"],
  },
});
