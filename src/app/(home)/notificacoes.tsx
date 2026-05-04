import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing, tabShadow } from "@/constants/theme";
import { useNotifications } from "@/context/notifications-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "notificacoes" | "mensagens";

function formatNotifDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} às ${hh}:${mn}`;
}

export default function NotificacoesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("notificacoes");
  const { notifications, markAllRead } = useNotifications();

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

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

      <View style={{ flex: 1 }}>
        {activeTab === "notificacoes" ? (
          notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma notificação por enquanto</Text>
              <Text style={styles.emptySubtitle}>Quando houver novidades, elas aparecerão aqui.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.notifList}
              contentContainerStyle={styles.notifListContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((notif) => (
                <View
                  key={notif.id}
                  style={[styles.notifItem, !notif.read && styles.notifItemUnread]}
                >
                  <View style={styles.notifIcon}>
                    <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{formatNotifDate(notif.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma mensagem por enquanto</Text>
            <Text style={styles.emptySubtitle}>Suas mensagens aparecerão aqui quando disponíveis.</Text>
          </View>
        )}
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

  notifList: {
    flex: 1,
  },
  notifListContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["4"],
    paddingBottom: spacing["16"],
    gap: spacing["4"],
  },
  notifItem: {
    flexDirection: "row",
    gap: spacing["6"],
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing["7"],
    alignItems: "flex-start",
  },
  notifItemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "#FEF3DC",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: spacing["2"],
  },
  notifTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  notifBody: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  notifTime: {
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
});
