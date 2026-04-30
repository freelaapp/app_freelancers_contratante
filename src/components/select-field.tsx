import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  label?: string;
  placeholder: string;
  value?: string;
  onPress?: () => void;
  error?: string;
  style?: ViewStyle;
};

export function SelectField({ label, placeholder, value, onPress, error, style }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.container, error ? styles.containerError : styles.containerDefault]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing["3"],
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  container: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["7"],
  },
  containerDefault: {
    borderColor: colors.border,
  },
  containerError: {
    borderColor: colors.error,
  },
  value: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  placeholder: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.error,
  },
});
