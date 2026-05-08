import { PageHeader } from "@/components/page-header";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { summaryService, type ContractorSummary } from "@/services/summary.service";
import { vagasService } from "@/services/vagas.service";
import type { VagaApi } from "@/types/vagas";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatShortDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`;
}

function formatBRL(cents?: number): string {
  if (cents == null) return "R$ 0,00";
  const val = cents / 100;
  const intPart = Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = Math.round((val % 1) * 100).toString().padStart(2, "0");
  return `R$ ${intPart},${decPart}`;
}

function resolveVagaValueInCents(item: VagaApi): number | undefined {
  const chargeAmount = item.chargeAmountInCents as number | undefined;
  if (chargeAmount != null) return chargeAmount;
  const totalAmount = item.totalAmountInCents as number | undefined;
  if (totalAmount != null) return totalAmount;
  const payment = item.payment as number | undefined;
  if (payment != null) return payment;
  const value = item.value as number | undefined;
  if (value != null) return Math.round(value * 100);
  return undefined;
}

type PaymentStatus = "Pago" | "Pendente";

const PAYMENT_CONFIRMED_STATUSES = new Set([
  "active",
  "in_progress",
  "started",
  "checking_in",
  "checking_out",
  "transfer_pending",
  "finished",
  "completed",
  "done",
  "closed",
]);

function mapVagaToPaymentStatus(vaga: VagaApi): PaymentStatus {
  const normalized = (vaga.status ?? "").toLowerCase();
  return PAYMENT_CONFIRMED_STATUSES.has(normalized) ? "Pago" : "Pendente";
}

export default function FinanceiroScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ContractorSummary>({});
  const [vagas, setVagas] = useState<VagaApi[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.module || !user?.contractorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [sumResult, vagasResult] = await Promise.allSettled([
      summaryService.getContractorSummary(),
      vagasService.listByContractor(user.module, user.contractorId),
    ]);
    if (sumResult.status === "fulfilled") setSummary(sumResult.value);
    if (vagasResult.status === "fulfilled") setVagas(vagasResult.value);
    setLoading(false);
  }, [user?.module, user?.contractorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const estesMesCents = (() => {
    const apiValue = summary.currentMonthSpent ?? summary.totalSpent;
    if (apiValue != null && apiValue > 0) return apiValue;
    return vagas
      .filter((v) => {
        const dateStr = (v.date ?? v.startTime) as string | undefined;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonth;
      })
      .reduce((acc, v) => acc + (resolveVagaValueInCents(v) ?? 0), 0);
  })();

  const pendingCents = (() => {
    const apiValue = summary.pendingAmount;
    if (apiValue != null && apiValue > 0) return apiValue;
    return vagas
      .filter((v) => mapVagaToPaymentStatus(v) === "Pendente")
      .reduce((acc, v) => acc + (resolveVagaValueInCents(v) ?? 0), 0);
  })();

  return (
    <View style={styles.screen}>
      <PageHeader title="Financeiro" />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gastosCard}>
            <Text style={styles.gastosTitle}>Meus Gastos</Text>
            <View style={styles.statRow}>
              <View style={[styles.statBox, styles.statBoxAmber]}>
                <View style={styles.statLabelRow}>
                  <Ionicons name="trending-up-outline" size={14} color="#fff" />
                  <Text style={styles.statLabelAmber}>Este mês</Text>
                </View>
                <Text style={styles.statValueAmber}>{formatBRL(estesMesCents)}</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxWhite]}>
                <View style={styles.statLabelRow}>
                  <Ionicons name="time-outline" size={14} color={colors.muted} />
                  <Text style={styles.statLabelMuted}>Pendente</Text>
                </View>
                <Text style={styles.statValueDark}>{formatBRL(pendingCents)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Histórico de Pagamentos</Text>
          {vagas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum pagamento encontrado.</Text>
            </View>
          ) : (
            <View style={styles.historicoCard}>
              {vagas.map((vaga, index) => {
                const status = mapVagaToPaymentStatus(vaga);
                const valueCents = resolveVagaValueInCents(vaga);
                return (
                  <View key={vaga.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <View style={styles.paymentItem}>
                      <View style={styles.paymentLeft}>
                        <Text style={styles.paymentTitle} numberOfLines={1}>
                          {vaga.title}
                        </Text>
                        <Text style={styles.paymentDate}>
                          {formatShortDate(vaga.date)}
                        </Text>
                      </View>
                      <View style={styles.paymentRight}>
                        <Text style={styles.paymentValue}>
                          {valueCents != null ? formatBRL(valueCents) : "—"}
                        </Text>
                        <Text
                          style={[
                            styles.paymentStatus,
                            status === "Pago" ? styles.statusPago : styles.statusPendente,
                          ]}
                        >
                          {status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scroll: {
    flex: 1,
  },
  loader: {
    marginTop: spacing["16"],
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    paddingBottom: spacing["16"],
  },
  gastosCard: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    marginBottom: spacing["8"],
    ...cardShadowStrong,
  },
  gastosTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["6"],
  },
  statRow: {
    flexDirection: "row",
    gap: spacing["6"],
  },
  statBox: {
    flex: 1,
    borderRadius: radii.xl,
    padding: spacing["6"],
  },
  statBoxAmber: {
    backgroundColor: colors.primary,
  },
  statBoxWhite: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  statLabelAmber: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: "rgba(255,255,255,0.85)",
  },
  statLabelMuted: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.muted,
  },
  statValueAmber: {
    fontSize: 26,
    fontWeight: fontWeights.bold,
    color: colors.white,
    marginTop: spacing["2"],
  },
  statValueDark: {
    fontSize: 26,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing["2"],
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["4"],
  },
  historicoCard: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    overflow: "hidden",
    ...cardShadowStrong,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["10"],
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing["8"],
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["7"],
  },
  paymentLeft: {
    flex: 1,
    marginRight: spacing["6"],
  },
  paymentTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  paymentDate: {
    fontSize: fontSizes.xs,
    color: colors.muted,
    marginTop: spacing["1"],
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  paymentStatus: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    marginTop: spacing["1"],
  },
  statusPago: {
    color: "#16A34A",
  },
  statusPendente: {
    color: "#D97706",
  },
});
