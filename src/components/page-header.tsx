import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  badge?: string;
  subtitle?: string;
  onBack?: () => void;
  rounded?: boolean;
  inline?: boolean;
};

export function PageHeader({ title, badge, subtitle, onBack, rounded = false, inline = false }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function handleBack() {
    if (onBack) onBack();
    else router.back();
  }

  if (inline) {
    return (
      <View style={[styles.inlineContainer, { paddingTop: insets.top + spacing["10"] }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.inlineTitle}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing["10"] }, rounded && styles.rounded]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.textBlock}>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing["16"],
    paddingBottom: spacing["12"],
    gap: spacing["8"],
  },
  rounded: {
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["10"],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  badge: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    fontWeight: fontWeights.regular,
  },
  title: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.muted,
    lineHeight: 20,
  },
  inlineContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing["16"],
    paddingBottom: spacing["12"],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["10"],
  },
  inlineTitle: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: 28,
  },
});
