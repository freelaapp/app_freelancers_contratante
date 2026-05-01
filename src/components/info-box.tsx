import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

export function InfoBox({ icon, title, body }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8E7",
    borderRadius: radii.lg,
    padding: spacing["7"],
    flexDirection: "row",
    gap: spacing["5"],
    alignItems: "flex-start",
  },
  textWrapper: {
    flex: 1,
    gap: spacing["2"],
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  body: {
    fontSize: fontSizes.xs + 2,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
