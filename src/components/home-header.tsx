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
      colors={["#ECA826", "#F2C94C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.card, { paddingTop: top + 16 }]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          {/* Mascot logo */}
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
            <Ionicons name="chatbubble-outline" size={20} color="#1A1A2E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onNotifications} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#1A1A2E" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats sub-cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={16} color="#1A1A2E" />
          <Text style={styles.statValue}>{saldo}</Text>
          <Text style={styles.statLabel}>Gastos do mês</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={16} color="#1A1A2E" />
          <Text style={styles.statValue}>{vagas}</Text>
          <Text style={styles.statLabel}>Vagas</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={16} color="#1A1A2E" />
          <Text style={styles.statValue}>{avaliacao}</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  eyes: {
    flexDirection: "row",
    gap: 8,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1A1A2E",
  },
  smile: {
    width: 18,
    height: 8,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#1A1A2E",
  },
  greetingColumn: {
    gap: 2,
  },
  greetingLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(26, 26, 46, 0.70)",
  },
  greetingName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "400",
    color: "rgba(26, 26, 46, 0.70)",
    textAlign: "center",
  },
});
