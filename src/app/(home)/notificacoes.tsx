import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing, tabShadow } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emptyText}>
          {activeTab === "notificacoes"
            ? "Nenhuma notificação no momento"
            : "Nenhuma mensagem no momento"}
        </Text>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["16"],
    paddingTop: spacing["8"],
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    fontWeight: fontWeights.medium,
    textAlign: "center",
    paddingVertical: spacing["8"],
  },
});
