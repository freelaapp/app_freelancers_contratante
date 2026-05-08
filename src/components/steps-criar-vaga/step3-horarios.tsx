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
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="calendar-outline" size={12} color={colors.primary} />
          <Text style={styles.metaPillText}>{dataEvento}</Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons name="time-outline" size={12} color={colors.primary} />
          <Text style={styles.metaPillText}>
            {String(horaInicioServico).padStart(2, "0")}h–{String(horaFimServico).padStart(2, "0")}h
          </Text>
        </View>
      </View>

      <HourGrid
        label="Início do serviço"
        selectedHour={
          horarioInicio ? parseInt(horarioInicio.split(":")[0], 10) : null
        }
        availableHours={availableHours}
        onSelect={onHorarioInicioChange}
      />

      {horarioInicio && horarioFim && duration && (
        <View style={styles.durationPill}>
          <Ionicons name="timer-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.durationText}>{duration} de duração</Text>
        </View>
      )}

      {horarioInicio && (
        <>
          <View style={styles.gridsDivider} />
          <HourGrid
            label="Término do serviço"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["8"],
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    backgroundColor: "#FFFBEB",
    borderRadius: radii.full,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["3"],
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  metaPillText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  gridsDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing["8"],
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: spacing["5"],
    paddingHorizontal: spacing["10"],
    gap: spacing["4"],
    marginTop: spacing["6"],
    alignSelf: "center",
  },
  durationText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});

const hourStyles = StyleSheet.create({
  container: {
    marginBottom: spacing["4"],
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing["5"],
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    backgroundColor: "#FFFBEB",
    borderRadius: radii.full,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["2"],
    alignSelf: "flex-start",
    marginBottom: spacing["5"],
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["4"],
  },
  btn: {
    width: 64,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDefault: {
    backgroundColor: colors.white,
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