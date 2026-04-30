import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle: string;
  onBack?: () => void;
};

export function CompactHeader({ title, subtitle, onBack }: Props) {
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: top + 12 }]}>
      <View style={styles.circleL} />
      <View style={styles.circleM} />
      <View style={styles.circleS} />

      <TouchableOpacity
        style={styles.backRow}
        onPress={onBack ?? (() => router.back())}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>

      <View style={styles.subtitleRow}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>freela</Text>
        </View>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 0.22,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  circleL: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: -40,
    right: -40,
  },
  circleM: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: 10,
    right: 80,
  },
  circleS: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.08)",
    bottom: -10,
    left: -20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginLeft: 8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#F5A623",
  },
  subtitleText: {
    fontSize: 14,
    color: "#1A1A2E",
    opacity: 0.8,
    flex: 1,
  },
});
