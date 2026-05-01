import { colors, spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

type Props = {
  marginHorizontal?: number;
  color?: string;
  orientation?: "horizontal" | "vertical";
  height?: number;
};

export function Divider({ marginHorizontal = 0, color = colors.border, orientation = "horizontal", height }: Props) {
  if (orientation === "vertical") {
    return <View style={[styles.vertical, { backgroundColor: color, height: height ?? 32 }]} />;
  }
  return <View style={[styles.horizontal, { marginHorizontal, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  horizontal: { height: 1 },
  vertical: { width: 1, marginHorizontal: spacing["4"] },
});
