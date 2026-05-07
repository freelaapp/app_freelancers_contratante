import { Divider } from "@/components/divider";
import { StatusBadge } from "@/components/status-badge";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { type VagaStatus } from "@/types/vagas";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  location: string;
  date: string;
  time: string;
  value: string;
  status: VagaStatus;
  onPress?: () => void;
};

const BADGE_LABEL: Record<VagaStatus, string> = {
  aberta: "Aberta",
  preenchida: "Preenchida",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export function VagaCard({ title, location, date, time, value, status, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <StatusBadge status={status} label={BADGE_LABEL[status]} />
      </View>

      <Text style={styles.location}>{location}</Text>

      <Divider />

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.meta}>{date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.meta}>{time}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["8"],
    gap: spacing["4"],
  },
  pressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing["4"],
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  location: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: -spacing["2"],
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["5"],
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    flex: 1,
  },
  meta: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
});
