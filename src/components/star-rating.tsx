import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  count: number;
  size?: number;
  interactive?: boolean;
  onPress?: (value: number) => void;
};

export function StarRating({ count, size = 14, interactive = false, onPress }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < count;
        const star = (
          <Ionicons
            key={i}
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? colors.primary : "#D1D5DB"}
          />
        );
        if (interactive && onPress) {
          return (
            <Pressable key={i} onPress={() => onPress(i + 1)}>
              {star}
            </Pressable>
          );
        }
        return star;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});
