import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "notificacoes" | "mensagens";

type Notificacao = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
};

const NOTIFICACOES: Notificacao[] = [
  {
    id: "1",
    icon: "checkmark-circle",
    titulo: "Vaga aceita!",
    descricao: "Você foi aceito para Garçom - Evento Corporativo no dia 22 Fev.",
    tempo: "2h atrás",
    lida: false,
  },
  {
    id: "2",
    icon: "gift",
    titulo: "Promoção especial",
    descricao: "Complete 5 trabalhos esse mês e ganhe um bônus de R$50!",
    tempo: "5h atrás",
    lida: false,
  },
  {
    id: "3",
    icon: "megaphone",
    titulo: "Novidade no app",
    descricao: "Agora você pode adicionar vídeo de apresentação no seu perfil.",
    tempo: "1 dia atrás",
    lida: true,
  },
  {
    id: "4",
    icon: "briefcase",
    titulo: "Nova vaga na sua região",
    descricao: "Bartender para festa premium - R$300. A 3km de você.",
    tempo: "1 dia atrás",
    lida: true,
  },
  {
    id: "5",
    icon: "checkmark-circle",
    titulo: "Pagamento recebido",
    descricao: "R$250 referente ao serviço Garçom - Buffet Elegance foi depositado.",
    tempo: "2 dias atrás",
    lida: true,
  },
];

const MENSAGENS: Notificacao[] = [
  {
    id: "m1",
    icon: "chatbubble",
    titulo: "Buffet Elegance",
    descricao: "Olá! Você pode confirmar sua presença para amanhã?",
    tempo: "1h atrás",
    lida: false,
  },
  {
    id: "m2",
    icon: "chatbubble",
    titulo: "Evento Corporativo XP",
    descricao: "O uniforme será fornecido no local. Chegue 30min antes.",
    tempo: "3h atrás",
    lida: false,
  },
];

function NotificacaoItem({ item }: { item: Notificacao }) {
  return (
    <TouchableOpacity
      style={[styles.item, item.lida ? styles.itemLida : styles.itemNaoLida]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, item.lida ? styles.iconWrapperLida : styles.iconWrapperNaoLida]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.lida ? colors.muted : colors.white}
        />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitulo}>{item.titulo}</Text>
        <Text style={styles.itemDescricao}>{item.descricao}</Text>
        <Text style={styles.itemTempo}>{item.tempo}</Text>
      </View>

      {!item.lida && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

export default function NotificacoesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("notificacoes");

  const naoLidasNotif = NOTIFICACOES.filter((n) => !n.lida).length;
  const naoLidasMsg = MENSAGENS.filter((n) => !n.lida).length;
  const lista = activeTab === "notificacoes" ? NOTIFICACOES : MENSAGENS;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
      </View>

      {/* Tabs */}
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
            {naoLidasNotif > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{naoLidasNotif}</Text>
              </View>
            )}
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
            {naoLidasMsg > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{naoLidasMsg}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lista.map((item) => (
          <NotificacaoItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["8"],
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["10"],
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },

  // Tabs
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
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
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: radii.full,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },

  // Lista
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["16"],
    gap: spacing["4"],
  },

  // Item
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing["6"],
    padding: spacing["8"],
    borderRadius: radii["2xl"],
  },
  itemNaoLida: {
    backgroundColor: "#FEF3DC",
  },
  itemLida: {
    backgroundColor: colors.white,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  iconWrapperNaoLida: {
    backgroundColor: colors.primary,
  },
  iconWrapperLida: {
    backgroundColor: colors.border,
  },
  itemContent: {
    flex: 1,
    gap: spacing["2"],
  },
  itemTitulo: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  itemDescricao: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemTempo: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginTop: spacing["1"],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    marginTop: spacing["2"],
    flexShrink: 0,
  },
});
