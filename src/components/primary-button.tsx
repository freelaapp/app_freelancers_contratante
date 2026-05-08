import { colors, fontSizes, fontWeights, gradients, radii } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, icon = "+", disabled = false, loading = false }: Props) {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // skewX não é suportado pelo native driver — useNativeDriver: false aqui
    Animated.loop(
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnim, {
          toValue: 5,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(chevronAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={gradients.button.colors}
        start={gradients.button.start}
        end={gradients.button.end}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.diagonalOverlay,
            {
              transform: [
                { translateX: slideAnim },
                { skewX: "-20deg" },
              ],
            },
          ]}
        />
        {loading ? (
          <ActivityIndicator color={colors.inkButton} size="small" testID="primary-button-loading" />
        ) : (
          <View style={styles.labelRow}>
            <Animated.Text style={styles.label}>
              {icon}{"   "}{label}{"   "}
            </Animated.Text>
            <Animated.Text
              style={[styles.label, { transform: [{ translateX: chevronAnim }] }]}
            >
              ›
            </Animated.Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  gradient: {
    height: 56,
    borderRadius: radii.xl,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  diagonalOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "45%",
    backgroundColor: colors.overlayButtonShade,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.inkButton,
  },
});
