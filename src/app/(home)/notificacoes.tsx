import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing, tabShadow } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "notificacoes" | "mensagens";

export default function NotificacoesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("notificacoes");

  return (
    <View style={styles.screen}>
      <PageHeader title="Notificações" inline />

      <View style={styles.tabsWrapper}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "notificacoes" && styles.tabActive]}
            onPress={() => setActiveTab("notificacoes")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications-outline"
              size={16}
              color={activeTab === "notificacoes" ? colors.ink : colors.muted}
            />
            <Text style={[styles.tabText, activeTab === "notificacoes" && styles.tabTextActive]}>
              Notificações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "mensagens" && styles.tabActive]}
            onPress={() => setActiveTab("mensagens")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={activeTab === "mensagens" ? colors.ink : colors.muted}
            />
            <Text style={[styles.tabText, activeTab === "mensagens" && styles.tabTextActive]}>
              Mensagens
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons
            name={activeTab === "notificacoes" ? "notifications-off-outline" : "chatbubble-ellipses-outline"}
            size={48}
            color={colors.muted}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {activeTab === "notificacoes"
            ? "Nenhuma notificação por enquanto"
            : "Nenhuma mensagem por enquanto"}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === "notificacoes"
            ? "Quando houver novidades, elas aparecerão aqui."
            : "Suas mensagens aparecerão aqui quando disponíveis."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  tabsWrapper: {
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["8"],
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: radii.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    paddingVertical: spacing["5"],
    borderRadius: radii.full,
  },
  tabActive: {
    backgroundColor: colors.white,
    ...tabShadow,
  },
  tabText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: fontWeights.semibold,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["12"],
    gap: spacing["6"],
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["4"],
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
