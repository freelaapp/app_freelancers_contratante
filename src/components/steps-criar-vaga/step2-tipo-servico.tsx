import { ServiceChip } from "@/components/service-chip";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { StyleSheet, Text, View } from "react-native";

export type Step2Props = {
  selectedServices: string[];
  onToggle: (id: string) => void;
  modulo: ModuloTarifas | null;
};

function TarifaCard({ tarifa }: { tarifa: Tarifa }) {
  return (
    <View style={tarifaStyles.card}>
      <Text style={tarifaStyles.title}>Informações do serviço</Text>
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
        <Text style={tarifaStyles.labelSmall}>Freelancer recebe</Text>
        <Text style={tarifaStyles.valueGreen}>R$ {tarifa.freelancerRecebe.toFixed(2)}</Text>
      </View>
    </View>
  );
}

export function Step2TipoServico({ selectedServices, onToggle, modulo }: Step2Props) {
  const selectedId = selectedServices[0];
  const tarifa = selectedId && modulo ? getTarifa(modulo, selectedId) : null;
  const serviceLabel = SERVICES.find((s) => s.id === selectedId)?.label ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Que tipo de profissional você precisa?</Text>
      <Text style={styles.subtitle}>Selecione o serviço desejado</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing["6"],
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
    marginTop: spacing["6"],
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
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing["6"],
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["5"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["3"],
  },
  label: {
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  value: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing["4"],
  },
  labelSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  valueSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  valueGreen: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#16A34A",
  },
});