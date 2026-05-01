import { colors, spacing } from "@/constants/theme";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
  showTopBorder?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BottomActionBar({
  children,
  backgroundColor = colors.background,
  showTopBorder = false,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor,
          paddingBottom: insets.bottom + spacing["6"],
          borderTopWidth: showTopBorder ? 1 : 0,
          borderTopColor: showTopBorder ? colors.border : "transparent",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["6"],
    zIndex: 2,
  },
});
