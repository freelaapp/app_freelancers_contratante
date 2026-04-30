import { PageHeader } from "@/components/page-header";
import { VagaCard } from "@/components/vaga-card";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { VAGA_FILTERS } from "@/utils/vaga-filters";
import { VAGAS_MOCK, type Vaga, type VagaStatus } from "@/utils/vagas-mock";
import { useState } from "react";
import {
  FlatList,
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
  const [activeFilter, setActiveFilter] = useState("todos");

  const filtered = VAGAS_MOCK.filter((v) =>
    STATUS_BY_FILTER[activeFilter].includes(v.status)
  );

  return (
    <View style={styles.screen}>
      <PageHeader title="Minhas Contratações" />

      <View style={styles.card}>

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

        <FlatList
          data={filtered}
          keyExtractor={(item: Vaga) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <VagaCard
              title={item.title}
              location={item.location}
              date={item.date}
              time={item.time}
              value={item.value}
              status={item.status}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    paddingTop: spacing["10"],
    paddingHorizontal: spacing["8"],
    gap: spacing["8"],
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing["4"],
    paddingBottom: spacing["2"],
  },
  filterChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing["10"],
    paddingVertical: spacing["5"],
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
    paddingBottom: spacing["16"],
  },
  separator: {
    height: 0,
  },
});
