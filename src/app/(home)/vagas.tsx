import { FilterChipBar } from "@/components/filter-chip-bar";
import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { type VagaStatus } from "@/types/api";
import { VAGA_FILTERS } from "@/utils/vaga-filters";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const STATUS_BY_FILTER: Record<string, VagaStatus[]> = {
  todos: ["confirmado", "aguardando", "finalizado"],
  confirmados: ["confirmado"],
  aguardando: ["aguardando"],
  finalizados: ["finalizado"],
};

export default function VagasScreen() {
  const [activeFilter, setActiveFilter] = useState("todos");

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
          <Text style={styles.emptyText}>Nenhuma contratação encontrada</Text>
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
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    fontWeight: fontWeights.medium,
    textAlign: "center",
    paddingVertical: spacing["8"],
  },
});
