import { StatusBadge } from "@/components/status-badge";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";

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

const BADGE_LABEL: Record<BookingStatus, string> = {
  confirmado: "Confirmado",
  aguardando: "Aguardando",
  cancelado: "Cancelado",
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
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <StatusBadge status={status} label={BADGE_LABEL[status]} />
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
    ...cardShadowStrong,
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
