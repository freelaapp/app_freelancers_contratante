import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Step3Props = {
  dataEvento: string;
  horarioInicio: string;
  horarioFim: string;
  onHorarioInicioChange: (value: string) => void;
  onHorarioFimChange: (value: string) => void;
  jornadaMinima?: number;
};

function isToday(displayDate: string): boolean {
  if (!displayDate) return false;
  const [dd, mm, yyyy] = displayDate.split("/").map(Number);
  const today = new Date();
  return (
    dd === today.getDate() &&
    mm === today.getMonth() + 1 &&
    yyyy === today.getFullYear()
  );
}

function getAvailableHours(displayDate: string): number[] {
  const minHour = isToday(displayDate) ? new Date().getHours() + 1 : 0;
  return Array.from({ length: 24 }, (_, i) => i).filter((h) => h >= minHour);
}

type HourGridProps = {
  label: string;
  selectedHour: number | null;
  availableHours: number[];
  onSelect: (hour: string) => void;
  jornadaMinima?: number;
  startHour?: number;
};

function HourGrid({
  label,
  selectedHour,
  availableHours,
  onSelect,
  jornadaMinima,
  startHour,
}: HourGridProps) {
  const endHours =
    jornadaMinima && startHour !== undefined
      ? availableHours.filter((h) => h >= startHour + jornadaMinima)
      : availableHours;

  const hours = endHours.length > 0 ? endHours : availableHours;

  return (
    <View style={hourStyles.container}>
      <Text style={hourStyles.label}>{label}</Text>
      {jornadaMinima && startHour !== undefined && (
        <Text style={hourStyles.hint}>Mínimo: {jornadaMinima}h de duração</Text>
      )}
      <View style={hourStyles.grid}>
        {hours.map((h) => {
          const isSelected = selectedHour === h;
          return (
            <TouchableOpacity
              key={h}
              style={[
                hourStyles.btn,
                isSelected ? hourStyles.btnSelected : hourStyles.btnDefault,
              ]}
              onPress={() => onSelect(`${String(h).padStart(2, "0")}:00`)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  hourStyles.btnText,
                  isSelected ? hourStyles.btnTextSelected : hourStyles.btnTextDefault,
                ]}
              >
                {`${String(h).padStart(2, "0")}h`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function calculateDuration(inicio: string, fim: string): string {
  if (!inicio || !fim) return "";
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);
  const durationMinutes = hf * 60 + mf - (hi * 60 + mi);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function Step3Horarios({
  dataEvento,
  horarioInicio,
  horarioFim,
  onHorarioInicioChange,
  onHorarioFimChange,
  jornadaMinima,
}: Step3Props) {
  const insets = useSafeAreaInsets();
  const availableHours = dataEvento ? getAvailableHours(dataEvento) : [];
  const startHour = horarioInicio ? parseInt(horarioInicio.split(":")[0], 10) : -1;

  const duration = calculateDuration(horarioInicio, horarioFim);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Qual horário do evento?</Text>
      <Text style={styles.subtitle}>
        Defina quando o serviço começa e termina
      </Text>

      <View style={styles.dateInfo}>
        <Text style={styles.dateLabel}>Data selecionada:</Text>
        <Text style={styles.dateValue}>{dataEvento}</Text>
      </View>

      <HourGrid
        label="Horário de início"
        selectedHour={
          horarioInicio ? parseInt(horarioInicio.split(":")[0], 10) : null
        }
        availableHours={availableHours}
        onSelect={onHorarioInicioChange}
      />

      {horarioInicio && (
        <HourGrid
          label="Horário de encerramento"
          selectedHour={
            horarioFim ? parseInt(horarioFim.split(":")[0], 10) : null
          }
          availableHours={availableHours}
          onSelect={onHorarioFimChange}
          jornadaMinima={jornadaMinima}
          startHour={startHour}
        />
      )}

      {horarioInicio && horarioFim && duration && (
        <View style={styles.durationBox}>
          <Text style={styles.durationLabel}>Duração total:</Text>
          <Text style={styles.durationValue}>{duration}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["6"],
    paddingTop: spacing["4"],
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
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: spacing["4"],
    borderRadius: radii.lg,
    marginBottom: spacing["6"],
    gap: spacing["2"],
  },
  dateLabel: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  dateValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  durationBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing["5"],
    borderRadius: radii.lg,
    marginTop: spacing["4"],
  },
  durationLabel: {
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  durationValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
});

const hourStyles = StyleSheet.create({
  container: {
    marginBottom: spacing["6"],
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["2"],
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.muted,
    marginBottom: spacing["3"],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["3"],
  },
  btn: {
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["5"],
    borderRadius: radii.md,
    borderWidth: 1.5,
    minWidth: 64,
    alignItems: "center",
  },
  btnDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  btnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
  },
  btnTextDefault: {
    color: colors.ink,
  },
  btnTextSelected: {
    color: colors.white,
  },
});