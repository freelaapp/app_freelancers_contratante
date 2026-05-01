import { fontSizes, fontWeights, radii, spacing, statusColors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type StatusKey = keyof typeof statusColors;

type Props = {
  status: StatusKey;
  label: string;
};

export function StatusBadge({ status, label }: Props) {
  const { bg, text } = statusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["2"],
    alignSelf: "flex-start",
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    includeFontPadding: false,
  },
});
