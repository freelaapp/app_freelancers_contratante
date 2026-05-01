import { FilterChipBar } from "@/components/filter-chip-bar";
import { PageHeader } from "@/components/page-header";
import { VagaCard } from "@/components/vaga-card";
import { colors, spacing } from "@/constants/theme";
import { VAGA_FILTERS } from "@/utils/vaga-filters";
import { VAGAS_MOCK, type VagaStatus } from "@/utils/vagas-mock";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
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
        <FilterChipBar options={VAGA_FILTERS} activeId={activeFilter} onSelect={setActiveFilter} />

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
  list: {
    gap: spacing["6"],
    paddingHorizontal: spacing["8"],
  },
});
