import { colors, fontWeights } from "@/constants/theme";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  initials: string;
  size?: number;
  backgroundColor?: string;
  imageUrl?: string | null;
};

export function AvatarInitials({ initials, size = 56, backgroundColor = colors.primary, imageUrl }: Props) {
  const containerStyle = [styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }];
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl, cache: 'reload' }}
        style={[containerStyle, { overflow: "hidden" }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={containerStyle}>
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
