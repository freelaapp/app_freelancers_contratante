import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Option = { id: string; label: string };

type Props = {
  options: Option[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function FilterChipBar({ options, activeId, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((opt) => {
          const active = activeId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(opt.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["6"],
  },
  row: {
    flexDirection: "row",
    gap: spacing["4"],
  },
  chip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing["10"],
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    lineHeight: fontSizes.base,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  labelActive: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },
});
