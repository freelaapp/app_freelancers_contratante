import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Step3Props = {
  dataEvento: string;
  horarioInicio: string;
  horarioFim: string;
  onHorarioInicioChange: (value: string) => void;
  onHorarioFimChange: (value: string) => void;
  jornadaMinima?: number;
  horaInicioServico: number;
  horaFimServico: number;
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

function getAvailableHours(displayDate: string, horaInicio: number, horaFim: number): number[] {
  const minHour = isToday(displayDate)
    ? Math.max(new Date().getHours() + 1, horaInicio)
    : horaInicio;
  return Array.from({ length: 24 }, (_, i) => i).filter(
    (h) => h >= minHour && h <= horaFim
  );
}

type HourGridProps = {
  label: string;
  selectedHour: number | null;
  availableHours: number[];
  onSelect: (hour: string) => void;
  jornadaMinima?: number;
  startHour?: number;
  horaFimServico?: number;
};

function HourGrid({
  label,
  selectedHour,
  availableHours,
  onSelect,
  jornadaMinima,
  startHour,
  horaFimServico,
}: HourGridProps) {
  const endHours =
    jornadaMinima && startHour !== undefined
      ? availableHours.filter(
          (h) =>
            h >= startHour + jornadaMinima &&
            (horaFimServico === undefined || h <= horaFimServico)
        )
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
  horaInicioServico,
  horaFimServico,
}: Step3Props) {
  const insets = useSafeAreaInsets();
  const availableHours = dataEvento
    ? getAvailableHours(dataEvento, horaInicioServico, horaFimServico)
    : [];
  const startHour = horarioInicio ? parseInt(horarioInicio.split(":")[0], 10) : -1;

  const duration = calculateDuration(horarioInicio, horarioFim);

  // 76 = paddingTop(12) + PrimaryButton(52) + paddingBottom(12) do BottomActionBar absoluto
  const BAR_HEIGHT = 76 + insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: BAR_HEIGHT + 16 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Qual horário do evento?</Text>
      <Text style={styles.subtitle}>
        Defina quando o serviço começa e termina
      </Text>

      <View style={styles.dateInfo}>
        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
        <Text style={styles.dateInfoText}>Data selecionada: {dataEvento}</Text>
      </View>

      <View style={styles.serviceHoursInfo}>
        <Ionicons name="time-outline" size={14} color={colors.primary} />
        <Text style={styles.serviceHoursText}>
          Disponível das {String(horaInicioServico).padStart(2, "0")}h às {String(horaFimServico).padStart(2, "0")}h
        </Text>
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
        <>
          <View style={styles.gridsDivider} />
          <HourGrid
            label="Horário de encerramento"
            selectedHour={
              horarioFim ? parseInt(horarioFim.split(":")[0], 10) : null
            }
            availableHours={availableHours}
            onSelect={onHorarioFimChange}
            jornadaMinima={jornadaMinima}
            startHour={startHour}
            horaFimServico={horaFimServico}
          />
        </>
      )}

      {horarioInicio && horarioFim && duration && (
        <View style={styles.durationBox}>
          <Text style={styles.durationLabel}>Duração total</Text>
          <View style={styles.durationValueContainer}>
            <Ionicons name="timer-outline" size={16} color={colors.primary} />
            <Text style={styles.durationValue}>{duration}</Text>
          </View>
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
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: spacing["3"],
    alignSelf: "flex-start",
    marginBottom: spacing["10"],
    gap: spacing["3"],
  },
  dateInfoText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  serviceHoursInfo: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  serviceHoursText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  gridsDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing["8"],
  },
  durationBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 14,
    borderRadius: 12,
    marginTop: spacing["4"],
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  durationLabel: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  durationValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  durationValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
});

const hourStyles = StyleSheet.create({
  container: {
    marginBottom: spacing["6"],
  },
  label: {
    fontSize: fontSizes.lg - 1,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["4"],
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["1"],
    alignSelf: "flex-start",
    marginBottom: spacing["5"],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["3"],
  },
  btn: {
    width: 56,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
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