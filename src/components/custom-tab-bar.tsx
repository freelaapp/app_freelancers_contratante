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
  {
    name: "index",
    label: "Home",
    icon: "home-outline",
    iconFocused: "home",
  },
  {
    name: "vagas",
    label: "Vagas",
    icon: "search-outline",
    iconFocused: "search",
  },
  {
    name: "criar-vaga",
    label: "Criar Vaga",
    icon: "add",
    iconFocused: "add",
    isCenter: true,
  },
  {
    name: "avaliacoes",
    label: "Avaliações",
    icon: "star-outline",
    iconFocused: "star",
  },
  {
    name: "profile",
    label: "Perfil",
    icon: "person-outline",
    iconFocused: "person",
  },
];

const ACTIVE = "#F5A623";
const INACTIVE = "#9CA3AF";

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  function handlePress(name: string) {
    navigation.navigate(name);
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, 12) }]}>
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
                <Ionicons name="add" size={32} color="#1A1A2E" />
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
              color={focused ? ACTIVE : INACTIVE}
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
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  activeIndicator: {
    position: "absolute",
    top: -10,
    width: "60%",
    height: 3,
    borderRadius: 2,
    backgroundColor: ACTIVE,
  },
  label: {
    fontSize: 11,
    color: INACTIVE,
    fontWeight: "500",
  },
  labelActive: {
    color: ACTIVE,
    fontWeight: "600",
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: -28,
    gap: 3,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACTIVE,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACTIVE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  centerLabel: {
    fontSize: 11,
    color: INACTIVE,
    fontWeight: "500",
  },
});
