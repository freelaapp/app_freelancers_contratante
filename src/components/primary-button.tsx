import { colors, fontSizes, fontWeights, gradients, radii } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  icon?: string;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, icon = "+", disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <LinearGradient
        colors={gradients.button.colors}
        start={gradients.button.start}
        end={gradients.button.end}
        style={styles.gradient}
      >
        <View style={styles.diagonalOverlay} />
        <Text style={styles.label}>
          {icon}{"   "}{label}{"   "}›
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  gradient: {
    height: 56,
    borderRadius: radii.xl,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  diagonalOverlay: {
    position: "absolute",
    right: -20,
    top: 0,
    bottom: 0,
    width: "45%",
    backgroundColor: colors.overlayButtonShade,
    transform: [{ skewX: "-20deg" }],
  },
  label: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.inkButton,
  },
});
