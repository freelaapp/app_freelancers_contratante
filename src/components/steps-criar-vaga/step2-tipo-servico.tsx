import { ServiceChip } from "@/components/service-chip";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Step2Props = {
  selectedServices: string[];
  onToggle: (id: string) => void;
  modulo: ModuloTarifas | null;
};

function TarifaCard({ tarifa }: { tarifa: Tarifa }) {
  return (
    <View style={tarifaStyles.card}>
      <View style={tarifaStyles.cardHeader}>
        <Ionicons name="information-circle" size={18} color={colors.primary} />
        <Text style={tarifaStyles.title}>Informações do serviço</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Valor por hora</Text>
        <Text style={tarifaStyles.value}>R$ {tarifa.valorHora.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Jornada mínima</Text>
        <Text style={tarifaStyles.value}>{tarifa.jornadaMinima}h</Text>
      </View>
      <View style={tarifaStyles.separator} />
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.labelSmall}>Taxa plataforma (20%)</Text>
        <Text style={tarifaStyles.valueSmall}>R$ {tarifa.taxaRetencao.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.labelGreen}>Freelancer recebe</Text>
        <View style={tarifaStyles.valueGreenContainer}>
          <Ionicons name="arrow-up-circle-outline" size={14} color="#16A34A" />
          <Text style={tarifaStyles.valueGreen}>R$ {tarifa.freelancerRecebe.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

export function Step2TipoServico({ selectedServices, onToggle, modulo }: Step2Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const selectedId = selectedServices[0];
  const tarifa = selectedId && modulo ? getTarifa(modulo, selectedId) : null;
  const serviceLabel = SERVICES.find((s) => s.id === selectedId)?.label ?? "";

  // Ao selecionar um serviço, rola para mostrar as informações de tarifa
  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  // 76 = paddingTop(12) + PrimaryButton(52) + paddingBottom(12) do BottomActionBar
  const BAR_HEIGHT = 76 + insets.bottom;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: BAR_HEIGHT + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Que tipo de profissional você precisa?</Text>
      <Text style={styles.subtitle}>Selecione o serviço desejado</Text>

      {selectedId && (
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.selectionBadgeText}>1 serviço selecionado</Text>
        </View>
      )}

      <View style={styles.chipsGrid}>
        {Array.from({ length: Math.ceil(SERVICES.length / 2) }, (_, i) => {
          const row = SERVICES.slice(i * 2, i * 2 + 2);
          return (
            <View key={i} style={styles.chipsRow}>
              {row.map((service) => (
                <ServiceChip
                  key={service.id}
                  emoji={service.emoji}
                  label={service.label}
                  selected={selectedServices.includes(service.id)}
                  onPress={() => onToggle(service.id)}
                />
              ))}
              {row.length === 1 && <View style={styles.chipPlaceholder} />}
            </View>
          );
        })}
      </View>

      {tarifa && (
        <View style={styles.tarifaContainer}>
          <TarifaCard tarifa={tarifa} />
        </View>
      )}

      {selectedServices.length > 0 && !tarifa && modulo && (
        <View style={styles.noTarifaBox}>
          <Text style={styles.noTarifaText}>
            Serviço &quot;{serviceLabel}&quot; não disponível para este módulo
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["10"],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing["2"],
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginBottom: spacing["6"],
  },
  selectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["2"],
    alignSelf: "flex-start",
    marginBottom: spacing["6"],
    gap: spacing["2"],
  },
  selectionBadgeText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  chipsGrid: {
    gap: spacing["4"],
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  chipPlaceholder: {
    flex: 1,
  },
  tarifaContainer: {
    marginTop: spacing["8"],
  },
  noTarifaBox: {
    backgroundColor: "#FEE2E2",
    padding: spacing["5"],
    borderRadius: radii.lg,
    marginTop: spacing["6"],
  },
  noTarifaText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    textAlign: "center",
  },
});

const tarifaStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["8"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["6"],
    paddingBottom: spacing["6"],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing["3"],
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["3"],
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  value: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing["6"],
  },
  labelSmall: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  valueSmall: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  labelGreen: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: "#16A34A",
  },
  valueGreenContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueGreen: {
    fontSize: fontSizes.lg - 1,
    fontWeight: fontWeights.bold,
    color: "#16A34A",
  },
});
