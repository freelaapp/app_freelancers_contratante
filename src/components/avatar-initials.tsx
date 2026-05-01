import { colors, fontWeights, radii } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  initials: string;
  size?: number;
  backgroundColor?: string;
};

export function AvatarInitials({ initials, size = 56, backgroundColor = colors.primary }: Props) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.32 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});
