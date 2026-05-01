import { cardShadow, radii, spacing } from "@/constants/theme";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function CardContainer({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    gap: spacing["6"],
    ...cardShadow,
  },
});
