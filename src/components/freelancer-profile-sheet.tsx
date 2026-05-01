import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Avaliacao = {
  estrelas: number;
  data: string;
  comentario: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  nome: string;
  iniciais: string;
  mediaNota?: number;
  jobsRealizados?: number;
  avaliacoes?: Avaliacao[];
};

function StarRow({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={size}
          color={i < count ? colors.primary : "#D1D5DB"}
        />
      ))}
    </View>
  );
}

function ReviewCard({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <StarRow count={avaliacao.estrelas} />
        <Text style={styles.reviewDate}>{avaliacao.data}</Text>
      </View>
      <Text style={styles.reviewText}>{avaliacao.comentario}</Text>
    </View>
  );
}

export function FreelancerProfileSheet({
  visible,
  onClose,
  nome,
  iniciais,
  mediaNota,
  jobsRealizados,
  avaliacoes = [],
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          {/* Avatar + Nome */}
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{iniciais}</Text>
            </View>
            <Text style={styles.nome}>{nome}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <View style={styles.statValueRow}>
                <Ionicons name="star" size={20} color={colors.primary} />
                <Text style={styles.statValue}>
                  {mediaNota != null ? mediaNota.toFixed(1) : "–"}
                </Text>
              </View>
              <Text style={styles.statLabel}>Média de nota</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValue}>
                {jobsRealizados != null ? jobsRealizados : "–"}
              </Text>
              <Text style={styles.statLabel}>Jobs realizados</Text>
            </View>
          </View>

          {/* Avaliações */}
          <Text style={styles.sectionTitle}>Avaliações recentes</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.reviewScroll}
            contentContainerStyle={styles.reviewList}
          >
            {avaliacoes.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma avaliação ainda.</Text>
            ) : (
              avaliacoes.map((a, i) => <ReviewCard key={i} avaliacao={a} />)
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    width: "100%",
    maxHeight: "80%",
  },

  // Profile row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing["8"],
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
  nome: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    textDecorationLine: "underline",
  },

  // Stats
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["8"],
    marginBottom: 20,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: spacing["2"],
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing["4"],
  },

  // Avaliações
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: 12,
  },
  reviewScroll: {
    flexShrink: 1,
  },
  reviewList: {
    gap: spacing["4"],
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: spacing["3"],
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  reviewText: {
    fontSize: fontSizes.base,
    color: colors.ink,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: spacing["8"],
  },
});
