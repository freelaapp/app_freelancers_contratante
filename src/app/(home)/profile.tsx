import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showDivider?: boolean;
};

function MenuItem({ icon, title, subtitle, onPress, showDivider = true }: MenuItemProps) {
  return (
    <>
      {showDivider && <View style={styles.divider} />}
      <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={22} color={colors.ink} style={styles.menuIcon} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </TouchableOpacity>
    </>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const insets = useSafeAreaInsets();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "C";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing["12"] }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + nome */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{user?.name ?? "Contratante"}</Text>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>0</Text>
          </View>
        </View>
      </View>

      {/* Fotos do estabelecimento */}
      <View style={[styles.card, styles.photosCard]}>
        <View style={styles.photosHeader}>
          <Ionicons name="image-outline" size={18} color={colors.ink} />
          <Text style={styles.photosTitle}>Fotos do Estabelecimento</Text>
        </View>
        <View style={styles.photosRow}>
          <TouchableOpacity style={styles.photoSlot} activeOpacity={0.7}>
            <Ionicons name="image-outline" size={28} color={colors.primary} />
            <Text style={styles.photoLabel}>Fachada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoSlot} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
            <Text style={styles.photoLabel}>Ambiente Interno</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu */}
      <View style={[styles.card, styles.menuCard]}>
        <MenuItem
          icon="receipt-outline"
          title="Meus Dados"
          subtitle="Dados do estabelecimento"
          showDivider={false}
        />
        <MenuItem
          icon="card-outline"
          title="Financeiro"
          subtitle="Gastos e histórico de pagamentos"
        />
        <MenuItem
          icon="settings-outline"
          title="Configurações"
          subtitle="Privacidade, notificações e conta"
        />
        <MenuItem
          icon="help-circle-outline"
          title="Ajuda"
          subtitle="Dúvidas e suporte"
        />
      </View>

      {/* Sair */}
      <View style={[styles.card, styles.logoutCard]}>
        <TouchableOpacity style={styles.logoutRow} onPress={signOut} activeOpacity={0.7}>
          <Ionicons name="exit-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["16"],
    gap: spacing["8"],
  },

  // Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["8"],
    paddingHorizontal: spacing["2"],
    marginBottom: spacing["4"],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  profileInfo: {
    gap: spacing["2"],
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  ratingText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },

  // Card base
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    ...CARD_SHADOW,
  },

  // Photos
  photosCard: {
    padding: spacing["8"],
    gap: spacing["8"],
  },
  photosHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  photosTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  photosRow: {
    flexDirection: "row",
    gap: spacing["8"],
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 1.4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: radii.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["3"],
    backgroundColor: "rgba(245, 166, 35, 0.05)",
  },
  photoLabel: {
    fontSize: fontSizes.base,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // Menu
  menuCard: {
    paddingHorizontal: spacing["8"],
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["10"],
    gap: spacing["6"],
  },
  menuIcon: {
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    gap: spacing["1"],
  },
  menuTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  menuSubtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Logout
  logoutCard: {
    paddingHorizontal: spacing["8"],
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["6"],
    paddingVertical: spacing["10"],
  },
  logoutText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },
});
