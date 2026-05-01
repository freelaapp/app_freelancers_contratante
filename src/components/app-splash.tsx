import { colors, fontSizes, fontWeights } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

type Props = {
  onFinish: () => void;
  isReady: boolean;
};

export function AppSplash({ onFinish, isReady }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onFinish);
    }, 300);
    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient
        colors={["#ECA826", "#F5A623"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.circleLeft} />
      <View style={styles.circleRight} />

      <Animated.View
        style={[
          styles.content,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Logo icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconRow}>
            <View style={styles.iconEye} />
            <View style={[styles.iconEye, { marginLeft: 6 }]} />
          </View>
          <View style={styles.iconSmile} />
        </View>

        <Text style={styles.title}>Freela</Text>
        <Text style={styles.subtitle}>
          Conecte-se às melhores oportunidades{"\n"}na sua região.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const CIRCLE_SIZE = width * 0.85;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  circleLeft: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    left: -CIRCLE_SIZE * 0.45,
    top: height * 0.15,
  },
  circleRight: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    right: -CIRCLE_SIZE * 0.45,
    bottom: height * 0.15,
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 52,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  iconEye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.dark,
  },
  iconSmile: {
    width: 28,
    height: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.dark,
  },
  title: {
    fontSize: 32,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.dark,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
  },
});
