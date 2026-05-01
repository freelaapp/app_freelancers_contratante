import { AvatarInitials } from "@/components/avatar-initials";
import { CenteredModal } from "@/components/centered-modal";
import { Divider } from "@/components/divider";
import { StarRating } from "@/components/star-rating";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
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

function ReviewCard({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <StarRating count={avaliacao.estrelas} size={16} />
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
    <CenteredModal visible={visible} onClose={onClose} contentStyle={{ maxHeight: "80%" }}>
      {/* Avatar + Nome */}
      <View style={styles.profileRow}>
        <AvatarInitials initials={iniciais} size={56} />
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
        <Divider orientation="vertical" height={32} />
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
    </CenteredModal>
  );
}

const styles = StyleSheet.create({
  // Profile row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing["8"],
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
