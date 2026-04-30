import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ServiceChip({ emoji, label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    borderRadius: 16,
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["6"],
  },
  chipDefault: {
    backgroundColor: "#EBEBEB",
  },
  chipSelected: {
    backgroundColor: "#FFF3DC",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 32,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  labelDefault: {
    color: colors.ink,
  },
  labelSelected: {
    color: colors.primary,
  },
});
