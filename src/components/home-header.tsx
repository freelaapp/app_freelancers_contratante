import { colors, fontSizes, fontWeights, gradients, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  userName: string;
  saldo?: string;
  vagas?: number;
  avaliacao?: string;
  onChat?: () => void;
  onNotifications?: () => void;
};

export function HomeHeader({
  userName,
  saldo = "R$2.830",
  vagas = 5,
  avaliacao = "4.9",
  onChat,
  onNotifications,
}: Props) {
  const { top } = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradients.primary.colors}
      start={gradients.primary.start}
      end={gradients.primary.end}
      style={[styles.card, { paddingTop: top + spacing["8"] }]}
    >
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={styles.logoBox}>
            <View style={styles.eyes}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
            <View style={styles.smile} />
          </View>

          <View style={styles.greetingColumn}>
            <Text style={styles.greetingLabel}>Olá,</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconButton} onPress={onChat} activeOpacity={0.8}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onNotifications} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color={colors.dark} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={16} color={colors.dark} />
          <Text style={styles.statValue}>{saldo}</Text>
          <Text style={styles.statLabel}>Gastos do mês</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={16} color={colors.dark} />
          <Text style={styles.statValue}>{vagas}</Text>
          <Text style={styles.statLabel}>Vagas</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={16} color={colors.dark} />
          <Text style={styles.statValue}>{avaliacao}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing["10"],
    paddingBottom: spacing["10"],
    borderBottomLeftRadius: radii["3xl"],
    borderBottomRightRadius: radii["3xl"],
    gap: spacing["8"],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["6"],
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
  },
  eyes: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.dark,
  },
  smile: {
    width: 18,
    height: 8,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: colors.dark,
  },
  greetingColumn: {
    gap: spacing["1"],
  },
  greetingLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.darkMuted,
  },
  greetingName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.overlayWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: spacing["4"],
    right: spacing["4"],
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.error,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.overlayDarkCard,
    borderRadius: radii.lg,
    padding: spacing["6"],
    alignItems: "center",
    gap: spacing["2"],
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    color: colors.darkMuted,
    textAlign: "center",
  },
});
