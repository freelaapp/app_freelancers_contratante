import { AvaliacaoCard } from "@/components/avaliacao-card";
import { CardContainer } from "@/components/card-container";
import { CardHeader } from "@/components/card-header";
import { Divider } from "@/components/divider";
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
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
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
      .listByContractor(contractorId)
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
});
