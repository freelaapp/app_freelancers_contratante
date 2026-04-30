import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabOption = {
  label: string;
  value: string;
};

type Props = {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
};

export function TabSelector({ options, value, onChange }: Props) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing["2"],
    height: 44,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
    height: 36,
  },
  label: {
    fontSize: fontSizes.base,
  },
  labelActive: {
    fontWeight: fontWeights.bold,
    color: colors.inkButton,
  },
  labelInactive: {
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
  },
});
