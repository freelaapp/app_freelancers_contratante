import { PageHeader } from "@/components/page-header";
import { VagaCard } from "@/components/vaga-card";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { VAGA_FILTERS } from "@/utils/vaga-filters";
import { VAGAS_MOCK, type Vaga, type VagaStatus } from "@/utils/vagas-mock";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [activeFilter, setActiveFilter] = useState("todos");

  const filtered = VAGAS_MOCK.filter((v) =>
    STATUS_BY_FILTER[activeFilter].includes(v.status)
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
        {/* Filtros sticky */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {VAGA_FILTERS.map((f) => {
              const active = activeFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Lista */}
        <View style={styles.list}>
          {filtered.map((item) => (
            <VagaCard
              key={item.id}
              title={item.title}
              location={item.location}
              date={item.date}
              time={item.time}
              value={item.value}
              status={item.status}
              onPress={() => router.push(`/(home)/vaga/${item.id}`)}
            />
          ))}
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
  filterWrapper: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["6"],
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  filterChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing["10"],
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    lineHeight: fontSizes.base,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  filterLabelActive: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
  list: {
    gap: spacing["6"],
    paddingHorizontal: spacing["8"],
  },
});
