import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";

type SectionHeaderProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onViewAll?: () => void;
};

export function SectionHeader({ title, icon, onViewAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {onViewAll && (
        <Pressable
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.viewAllPressed,
          ]}
          onPress={onViewAll}
          hitSlop={8}
        >
          <Text style={styles.viewAllText}>Ver todos</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["1"],
  },
  viewAllPressed: {
    opacity: 0.6,
  },
  viewAllText: {
    fontSize: fontSizes.md,
    color: colors.primary,
  },
});
