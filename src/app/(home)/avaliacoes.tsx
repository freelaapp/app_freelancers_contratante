import { CardContainer } from "@/components/card-container";
import { CardHeader } from "@/components/card-header";
import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AvaliacoesScreen() {
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
        <CardContainer style={styles.cardGap}>
          <CardHeader icon="information-circle-outline" title="Avalie suas últimas contratações" iconColor={colors.muted} />
          <Text style={styles.emptyText}>Nenhuma avaliação pendente</Text>
        </CardContainer>

        <CardContainer style={styles.cardGap}>
          <CardHeader icon="star" title="Recebidas" />
          <Text style={styles.emptyText}>Nenhuma avaliação recebida</Text>
        </CardContainer>

        <CardContainer style={styles.cardGap}>
          <CardHeader icon="star-outline" title="Feitas por mim" iconColor={colors.muted} />
          <Text style={styles.emptyText}>Nenhuma avaliação feita</Text>
        </CardContainer>
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
  cardGap: {
    gap: spacing["8"],
  },
  emptyText: {
    fontSize: fontSizes.base,
    color: colors.muted,
    fontWeight: fontWeights.medium,
    textAlign: "center",
    paddingVertical: spacing["4"],
  },
});
