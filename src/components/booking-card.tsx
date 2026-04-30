import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";

type BookingStatus = "confirmado" | "aguardando" | "cancelado";

type BookingCardProps = {
  title: string;
  location: string;
  date: string;
  time: string;
  value: string;
  status: BookingStatus;
  onPress?: () => void;
};

const BADGE_CONFIG: Record<
  BookingStatus,
  { bg: string; text: string; label: string }
> = {
  confirmado: { bg: "#D1FAE5", text: "#065F46", label: "Confirmado" },
  aguardando: { bg: "#FEF3C7", text: "#92400E", label: "Aguardando" },
  cancelado: { bg: "#FEE2E2", text: "#991B1B", label: "Cancelado" },
};

export function BookingCard({
  title,
  location,
  date,
  time,
  value,
  status,
  onPress,
}: BookingCardProps) {
  const badge = BADGE_CONFIG[status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Ionicons
          name="location-outline"
          size={13}
          color={colors.muted}
          style={styles.locationIcon}
        />
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.datetime}>
          {date} · {time}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.95,
  },
  row: {
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
    fontSize: 12,
    fontWeight: fontWeights.semibold,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing["3"],
  },
  locationIcon: {
    marginRight: spacing["2"],
  },
  location: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing["4"],
  },
  datetime: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
});
