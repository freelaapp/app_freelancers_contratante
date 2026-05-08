import { BookingCard } from "@/components/booking-card";
import { FilterChipBar } from "@/components/filter-chip-bar";
import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useExplore } from "@/hooks/use-explore";
import { mapApiStatus, formatVagaValue, resolveApiMoneyToReais } from "@/utils/vaga-status-map";
import { SERVICES } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

const SERVICE_FILTERS = [
  { id: "todos", label: "Todos" },
  ...SERVICES.map((s) => ({ id: s.label.toLowerCase(), label: s.label })),
];

export default function ExploreScreen() {
  const router = useRouter();
  const {
    loading,
    refreshing,
    error,
    search,
    activeServiceFilter,
    filteredVagas,
    setSearch,
    setActiveServiceFilter,
    refresh,
    retry,
  } = useExplore();

  return (
    <View style={styles.screen}>
      <PageHeader title="Explorar Vagas" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.stickyHeader}>
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.muted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por título ou serviço..."
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              testID="search-input"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>

          <FilterChipBar
            options={SERVICE_FILTERS}
            activeId={activeServiceFilter}
            onSelect={setActiveServiceFilter}
          />
        </View>

        <View style={styles.list}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
              testID="loading-indicator"
            />
          ) : error ? (
            <View style={styles.centerContainer} testID="error-container">
              <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
              <Text style={styles.errorText} testID="error-message">{error}</Text>
              <Pressable style={styles.retryButton} onPress={retry} testID="retry-button">
                <Text style={styles.retryLabel}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : filteredVagas.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={40} color={colors.muted} />
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptySubtext}>
                Ajuste o filtro ou a busca para encontrar vagas.
              </Text>
            </View>
          ) : (
            filteredVagas.map((item) => (
              <BookingCard
                key={item.id}
                title={item.title}
                location={(item.location ?? item.address ?? "") as string}
                date={formatApiDate(item.date as string | undefined)}
                time={formatApiTime(item.startTime as string | undefined)}
                value={formatVagaValue(resolveApiMoneyToReais(item as Record<string, unknown>))}
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
  stickyHeader: {
    backgroundColor: colors.background,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginHorizontal: spacing["8"],
    marginTop: spacing["8"],
    paddingHorizontal: spacing["8"],
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing["4"],
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
    paddingVertical: 0,
  },
  list: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    gap: spacing["4"],
  },
  loader: {
    marginTop: spacing["16"],
  },
  centerContainer: {
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
  errorText: {
    fontSize: fontSizes.base,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing["4"],
    backgroundColor: colors.primary,
    paddingHorizontal: spacing["12"],
    paddingVertical: spacing["6"],
    borderRadius: radii.full,
  },
  retryLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
});
