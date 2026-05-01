import { Divider } from "@/components/divider";
import { StarRating } from "@/components/star-rating";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  nome: string;
  data: string;
  estrelas: number;
  comentario: string;
  showDivider?: boolean;
};

export function AvaliacaoCard({ nome, data, estrelas, comentario, showDivider = true }: Props) {
  return (
    <>
      {showDivider && <Divider marginHorizontal={-spacing["8"]} />}
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.nome}>{nome}</Text>
          <View style={styles.ratingRow}>
            <StarRating count={estrelas} size={14} />
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </View>
        </View>
        <Text style={styles.data}>{data}</Text>
        <Text style={styles.comentario}>{'"'}{comentario}{'"'}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing["3"],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nome: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  data: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginTop: -spacing["1"],
  },
  comentario: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
