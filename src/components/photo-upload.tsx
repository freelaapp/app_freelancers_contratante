import { colors, fontSizes, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  uri?: string;
  onChange?: (uri: string) => void;
  label?: string;
};

export function PhotoUpload({ uri, onChange, label = "Foto/Imagem" }: Props) {
  async function handlePress() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange?.(result.assets[0].uri);
    }
  }

  if (uri) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.removeOverlay} onPress={() => onChange?.("")}>
          <Ionicons name="close-circle" size={22} color={colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="image-outline" size={28} color={colors.muted} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 90,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radii.lg,
  },
  removeOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
});
