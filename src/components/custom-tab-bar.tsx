import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabItem = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
};

const TABS: TabItem[] = [
  { name: "index", label: "Home", icon: "home-outline", iconFocused: "home" },
  { name: "vagas", label: "Vagas", icon: "search-outline", iconFocused: "search" },
  { name: "criar-vaga", label: "Criar Vaga", icon: "add", iconFocused: "add", isCenter: true },
  { name: "avaliacoes", label: "Avaliações", icon: "star-outline", iconFocused: "star" },
  { name: "profile", label: "Perfil", icon: "person-outline", iconFocused: "person" },
];

const HIDDEN_ROUTES = ["vaga/[id]", "notificacoes", "meus-dados"];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  const activeRoute = state.routes[state.index]?.name;
  if (HIDDEN_ROUTES.includes(activeRoute)) return null;

  function handlePress(name: string) {
    navigation.navigate(name);
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, spacing["6"]) }]}>
      {TABS.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        const focused = state.index === routeIndex;

        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.centerWrapper}
              onPress={() => handlePress(tab.name)}
              activeOpacity={0.85}
            >
              <View style={styles.centerButton}>
                <Ionicons name="add" size={32} color={colors.dark} />
              </View>
              <Text style={styles.centerLabel}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            {focused && <View style={styles.activeIndicator} />}
            <Ionicons
              name={focused ? tab.iconFocused : tab.icon}
              size={24}
              color={focused ? colors.primary : colors.muted}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingTop: spacing["5"],
    paddingHorizontal: spacing["4"],
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing["2"],
  },
  activeIndicator: {
    position: "absolute",
    top: -spacing["5"],
    width: "60%",
    height: 3,
    borderRadius: radii.xs,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    fontWeight: fontWeights.medium,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: -spacing["14"],
    gap: spacing["2"],
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: radii["3xl"],
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  centerLabel: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    fontWeight: fontWeights.medium,
  },
});
