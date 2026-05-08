import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Step2Props = {
  selectedServices: string[];
  onToggle: (id: string) => void;
  modulo: ModuloTarifas | null;
};

type ServiceCardProps = {
  emoji: string;
  label: string;
  horaInicio: number;
  horaFim: number;
  selected: boolean;
  onPress: () => void;
};

function ServiceCard({ emoji, label, horaInicio, horaFim, selected, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[cardStyles.card, selected && cardStyles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {selected && (
        <View style={cardStyles.checkBadge}>
          <Ionicons name="checkmark" size={10} color={colors.white} />
        </View>
      )}
      <Text style={cardStyles.emoji}>{emoji}</Text>
      <Text
        style={[cardStyles.label, selected && cardStyles.labelSelected]}
        numberOfLines={2}
      >
        {label}
      </Text>
      <View style={cardStyles.hoursRow}>
        <Ionicons name="time-outline" size={10} color={selected ? colors.primary : colors.muted} />
        <Text style={[cardStyles.hours, selected && cardStyles.hoursSelected]}>
          {String(horaInicio).padStart(2, "0")}h–{String(horaFim).padStart(2, "0")}h
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TarifaCard({ tarifa }: { tarifa: Tarifa }) {
  return (
    <View style={tarifaStyles.card}>
      <View style={tarifaStyles.cardHeader}>
        <Ionicons name="receipt-outline" size={16} color={colors.primary} />
        <Text style={tarifaStyles.title}>Estimativa de custo</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Valor por hora</Text>
        <Text style={tarifaStyles.value}>R$ {tarifa.valorHora.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Jornada mínima</Text>
        <View style={tarifaStyles.badgeContainer}>
          <Text style={tarifaStyles.badgeText}>{tarifa.jornadaMinima}h mínimo</Text>
        </View>
      </View>
      <View style={tarifaStyles.separator} />
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.labelSmall}>Taxa plataforma (20%)</Text>
        <Text style={tarifaStyles.valueSmall}>R$ {tarifa.taxaRetencao.toFixed(2)}/h</Text>
      </View>
      <View style={[tarifaStyles.row, tarifaStyles.lastRow]}>
        <Text style={tarifaStyles.labelGreen}>Freelancer recebe</Text>
        <Text style={tarifaStyles.valueGreen}>R$ {tarifa.freelancerRecebe.toFixed(2)}/h</Text>
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

  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  const BAR_HEIGHT = 76 + insets.bottom;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: BAR_HEIGHT + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {selectedId && (
        <View style={styles.selectionBadge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.selectionBadgeText}>
            {SERVICES.find((s) => s.id === selectedId)?.label ?? ""} selecionado
          </Text>
        </View>
      )}

      <View style={styles.cardsGrid}>
        {Array.from({ length: Math.ceil(SERVICES.length / 2) }, (_, i) => {
          const row = SERVICES.slice(i * 2, i * 2 + 2);
          return (
            <View key={i} style={styles.cardsRow}>
              {row.map((service) => (
                <ServiceCard
                  key={service.id}
                  emoji={service.emoji}
                  label={service.label}
                  horaInicio={service.horaInicio}
                  horaFim={service.horaFim}
                  selected={selectedServices.includes(service.id)}
                  onPress={() => onToggle(service.id)}
                />
              ))}
              {row.length === 1 && <View style={styles.cardPlaceholder} />}
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
    paddingTop: spacing["8"],
  },
  selectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: radii.full,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    alignSelf: "flex-start",
    marginBottom: spacing["6"],
    gap: spacing["3"],
    borderWidth: 1,
    borderColor: colors.primary + "40",
  },
  selectionBadgeText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  cardsGrid: {
    gap: spacing["4"],
  },
  cardsRow: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  cardPlaceholder: {
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

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["8"],
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "flex-start",
    gap: spacing["2"],
    position: "relative",
  },
  cardSelected: {
    backgroundColor: "#FFFBEB",
    borderColor: colors.primary,
  },
  checkBadge: {
    position: "absolute",
    top: spacing["4"],
    right: spacing["4"],
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    lineHeight: 17,
  },
  labelSelected: {
    color: colors.primaryDark,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: spacing["1"],
  },
  hours: {
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
  hoursSelected: {
    color: colors.primary,
  },
});

const tarifaStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
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
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  lastRow: {
    marginBottom: 0,
  },
  label: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  badgeContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: radii.full,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["1"],
  },
  badgeText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing["5"],
  },
  labelSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  valueSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  labelGreen: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: "#16A34A",
  },
  valueGreen: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: "#16A34A",
  },
});
