import { AvaliacaoCard } from "@/components/avaliacao-card";
import { CardContainer } from "@/components/card-container";
import { CardHeader } from "@/components/card-header";
import { Divider } from "@/components/divider";
import { PageHeader } from "@/components/page-header";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import {
  AVALIACOES_FEITAS,
  AVALIACOES_PENDENTES,
  AVALIACOES_RECEBIDAS,
} from "@/utils/avaliacoes-mock";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        {/* Pendentes */}
        <CardContainer style={styles.cardGap}>
          <CardHeader icon="information-circle-outline" title="Avalie suas últimas contratações" iconColor={colors.muted} />

          {AVALIACOES_PENDENTES.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <Divider marginHorizontal={0} />}
              <View style={styles.pendenteRow}>
                <View style={styles.pendenteInfo}>
                  <Text style={styles.pendenteTitle} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.pendenteMeta}>{item.freelancer} • {item.data}</Text>
                </View>
                <TouchableOpacity style={styles.avaliarBtn} activeOpacity={0.75}>
                  <Text style={styles.avaliarBtnText}>Avaliar</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.ink} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </CardContainer>

        {/* Recebidas */}
        <CardContainer style={styles.cardGap}>
          <CardHeader icon="star" title="Recebidas" />

          {AVALIACOES_RECEBIDAS.map((item, index) => (
            <AvaliacaoCard
              key={item.id}
              nome={item.nome}
              data={item.data}
              estrelas={item.estrelas}
              comentario={item.comentario}
              showDivider={index > 0}
            />
          ))}
        </CardContainer>

        {/* Feitas por mim */}
        <CardContainer style={styles.cardGap}>
          <CardHeader icon="star-outline" title="Feitas por mim" iconColor={colors.muted} />

          {AVALIACOES_FEITAS.map((item, index) => (
            <AvaliacaoCard
              key={item.id}
              nome={item.nome}
              data={item.data}
              estrelas={item.estrelas}
              comentario={item.comentario}
              showDivider={index > 0}
            />
          ))}
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
  pendenteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing["6"],
  },
  pendenteInfo: {
    flex: 1,
    gap: spacing["2"],
  },
  pendenteTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  pendenteMeta: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  avaliarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["4"],
  },
  avaliarBtnText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
});
