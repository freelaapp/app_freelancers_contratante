import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { type VagaStatus } from "@/utils/vagas-mock";
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

const BADGE: Record<VagaStatus, { bg: string; text: string; label: string }> = {
  confirmado: { bg: "#D1FAE5", text: "#065F46", label: "Confirmado" },
  aguardando: { bg: "#FEF3C7", text: "#92400E", label: "Aguardando" },
  finalizado: { bg: "#F3F4F6", text: "#6B7280", label: "Finalizado" },
};

export function VagaCard({ title, location, date, time, value, status, onPress }: Props) {
  const badge = BADGE[status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <Text style={styles.location}>{location}</Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.meta}>📅 {date}</Text>
        <Text style={styles.meta}>🕐 {time}</Text>
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
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["2"],
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeights.semibold,
  },
  location: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: -spacing["2"],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["5"],
  },
  meta: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
});
