import { AvaliacaoCard } from "@/components/avaliacao-card";
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
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
            <Text style={styles.cardTitle}>Avalie suas últimas contratações</Text>
          </View>

          {AVALIACOES_PENDENTES.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.itemDivider} />}
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
        </View>

        {/* Recebidas */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Recebidas</Text>
          </View>

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
        </View>

        {/* Feitas por mim */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={18} color={colors.muted} />
            <Text style={styles.cardTitle}>Feitas por mim</Text>
          </View>

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
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
} as const;

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
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    gap: spacing["8"],
    ...CARD_SHADOW,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing["4"],
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
