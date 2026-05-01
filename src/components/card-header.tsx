import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  iconColor?: string;
  iconSize?: number;
};

export function CardHeader({ icon, title, iconColor = colors.primary, iconSize = 18 }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
});
