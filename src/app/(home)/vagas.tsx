import { FilterChipBar } from "@/components/filter-chip-bar";
import { PageHeader } from "@/components/page-header";
import { VagaCard } from "@/components/vaga-card";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { vagasService } from "@/services/vagas.service";
import type { VagaApi, VagaStatus } from "@/types/vagas";
import { mapApiStatus, formatVagaValue } from "@/utils/vaga-status-map";
import { VAGA_FILTERS } from "@/utils/vaga-filters";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STATUS_BY_FILTER: Record<string, VagaStatus[]> = {
  todos: ["confirmado", "aguardando", "finalizado"],
  confirmados: ["confirmado"],
  aguardando: ["aguardando"],
  finalizados: ["finalizado"],
};

export default function VagasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [vagas, setVagas] = useState<VagaApi[]>([]);

  useEffect(() => {
    if (!user?.contractorId || !user?.module) {
      setLoading(false);
      return;
    }
    vagasService
      .listByContractor(user.module, user.contractorId)
      .then(setVagas)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = vagas.filter((v) =>
    STATUS_BY_FILTER[activeFilter].includes(mapApiStatus(v.status))
  );

  return (
    <View style={styles.screen}>
      <PageHeader title="Minhas Contratações" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <FilterChipBar options={VAGA_FILTERS} activeId={activeFilter} onSelect={setActiveFilter} />

        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptySubtext}>
                Ajuste o filtro ou crie uma nova vaga.
              </Text>
            </View>
          ) : (
            filtered.map((item) => (
              <VagaCard
                key={item.id}
                title={item.title}
                location={item.location ?? ""}
                date={item.date ?? ""}
                time={item.startTime ?? ""}
                value={formatVagaValue(item.value as number | undefined)}
                status={mapApiStatus(item.status)}
                onPress={() => router.push(`/(home)/vaga/${item.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["16"],
  },
  list: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    gap: spacing["4"],
  },
  loader: {
    marginTop: spacing["16"],
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: spacing["16"],
    gap: spacing["4"],
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  emptySubtext: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
  },
});
