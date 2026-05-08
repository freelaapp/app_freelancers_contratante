import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { goBackOrReplace } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Logo from '../../assets/images/icon.png';

type Props = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  isFirstScreen?: boolean;
};

export function CompactHeader({ title, subtitle, onBack, isFirstScreen = false }: Props) {
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (isFirstScreen) {
      // Se é a primeira tela, vai direto para login (sem chance de voltar)
      router.replace("/(auth)/login");
      return;
    }
    goBackOrReplace(router, "/(auth)/login");
  };

  return (
    <View style={[styles.header, { paddingTop: top + spacing["6"] }]}>
      <View style={styles.circleL} />
      <View style={styles.circleM} />
      <View style={styles.circleS} />

      <TouchableOpacity
        style={styles.backRow}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.dark} />
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>

      <View style={styles.subtitleRow}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logoImage} />
        </View>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 0.22,
    overflow: "hidden",
    paddingHorizontal: spacing["10"],
    paddingBottom: spacing["10"],
  },
  circleL: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.overlayDark,
    top: -40,
    right: -40,
  },
  circleM: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.overlayDark,
    top: 10,
    right: 80,
  },
  circleS: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.overlayDark,
    bottom: -10,
    left: -20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.dark,
    marginLeft: spacing["4"],
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing["6"],
    gap: spacing["4"],
  },
  logoContainer: {
    width: 38,
    height: 38,
    borderRadius: radii.md,

    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 45,
    height: 45,
  },
  subtitleText: {
    fontSize: fontSizes.xl,
    color: colors.dark,
    opacity: 0.8,
    flex: 1,
  },
});
