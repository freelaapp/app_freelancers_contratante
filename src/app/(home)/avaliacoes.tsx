import { CardContainer } from "@/components/card-container";
import { CardHeader } from "@/components/card-header";
import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { feedbacksService } from "@/services/feedbacks.service";
import type { FeedbackApi } from "@/types/vagas";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatFeedbackDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type AvaliacaoCardProps = {
  nome: string;
  data: string;
  estrelas: number;
  comentario?: string;
  showDivider?: boolean;
};

function AvaliacaoCard({ nome, data, estrelas, comentario, showDivider }: AvaliacaoCardProps) {
  return (
    <View>
      {showDivider && <View style={styles.divider} />}
      <View style={styles.avaliacaoRow}>
        <View style={styles.avaliacaoInfo}>
          <Text style={styles.avaliacaoNome}>{nome}</Text>
          <Text style={styles.avaliacaoData}>{data}</Text>
          {comentario ? <Text style={styles.avaliacaoComentario}>{comentario}</Text> : null}
        </View>
        <View style={styles.avaliacaoStars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < estrelas ? "star" : "star-outline"}
              size={14}
              color={i < estrelas ? colors.primary : colors.muted}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function AvaliacoesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recebidas, setRecebidas] = useState<FeedbackApi[]>([]);
  const [feitas, setFeitas] = useState<FeedbackApi[]>([]);

  useEffect(() => {
    if (!user) return;
    const contractorId = user.contractorId ?? user.id;
    feedbacksService
      .listByContractor(contractorId, user.module as "bars-restaurants" | "home-services")
      .then((feedbacks) => {
        const recv = feedbacks.filter(
          (f) => f.authorType !== "contractor"
        );
        const done = feedbacks.filter(
          (f) => f.authorType === "contractor"
        );
        setRecebidas(recv);
        setFeitas(done);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <View style={styles.screen}>
      <PageHeader
        title="Minhas Avaliações"
        subtitle="Veja e gerencie seus feedbacks"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <>
            <CardContainer style={styles.cardGap}>
              <CardHeader
                icon="information-circle-outline"
                title="Avalie suas últimas contratações"
                iconColor={colors.muted}
              />
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  Nenhuma avaliação pendente no momento.
                </Text>
              </View>
            </CardContainer>

            <CardContainer style={styles.cardGap}>
              <CardHeader icon="star" title="Recebidas" />
              {recebidas.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>
                    Nenhuma avaliação recebida ainda.
                  </Text>
                </View>
              ) : (
                recebidas.map((item, index) => (
                  <AvaliacaoCard
                    key={item.id}
                    nome={item.freelancerName ?? "Freelancer"}
                    data={formatFeedbackDate(item.createdAt)}
                    estrelas={item.stars}
                    comentario={item.comment}
                    showDivider={index > 0}
                  />
                ))
              )}
            </CardContainer>

            <CardContainer style={styles.cardGap}>
              <CardHeader icon="star-outline" title="Feitas por mim" iconColor={colors.muted} />
              {feitas.length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>
                    Você ainda não avaliou nenhum freelancer.
                  </Text>
                </View>
              ) : (
                feitas.map((item, index) => (
                  <AvaliacaoCard
                    key={item.id}
                    nome={item.freelancerName ?? "Freelancer"}
                    data={formatFeedbackDate(item.createdAt)}
                    estrelas={item.stars}
                    comentario={item.comment}
                    showDivider={index > 0}
                  />
                ))
              )}
            </CardContainer>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    paddingBottom: spacing["16"],
    gap: spacing["8"],
  },
  loader: {
    marginTop: spacing["16"],
  },
  cardGap: {
    gap: spacing["8"],
  },
  emptySection: {
    paddingVertical: spacing["4"],
  },
  emptySectionText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing["4"],
  },
  avaliacaoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing["4"],
  },
  avaliacaoInfo: {
    flex: 1,
    gap: spacing["1"],
  },
  avaliacaoNome: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  avaliacaoData: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  avaliacaoComentario: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing["2"],
  },
  avaliacaoStars: {
    flexDirection: "row",
    gap: 2,
  },
});
