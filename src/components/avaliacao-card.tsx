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

function StarRating({ count }: { count: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < count ? "star" : "star-outline"}
          size={14}
          color={colors.primary}
        />
      ))}
    </View>
  );
}

export function AvaliacaoCard({ nome, data, estrelas, comentario, showDivider = true }: Props) {
  return (
    <>
      {showDivider && <View style={styles.divider} />}
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.nome}>{nome}</Text>
          <View style={styles.ratingRow}>
            <StarRating count={estrelas} />
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </View>
        </View>
        <Text style={styles.data}>{data}</Text>
        <Text style={styles.comentario}>"{comentario}"</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -spacing["8"],
  },
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
  stars: {
    flexDirection: "row",
    gap: 2,
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
