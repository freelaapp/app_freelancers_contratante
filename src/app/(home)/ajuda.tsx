import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { goBackOrReplace } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "Como criar uma vaga?",
    answer:
      "Acesse a aba principal e toque em \"Nova Vaga\". Preencha os dados solicitados como tipo de serviço, data, horário e valor. Após revisar, publique a vaga para que os freelancers possam se candidatar.",
  },
  {
    id: 2,
    question: "Como funciona o pagamento?",
    answer:
      "O pagamento é processado de forma segura pela plataforma. Após confirmar um candidato, o valor fica retido até a conclusão do serviço. Você libera o pagamento ao marcar o evento como concluído.",
  },
  {
    id: 3,
    question: "Como avaliar um freelancer?",
    answer:
      "Ao encerrar um evento, você receberá uma notificação para avaliar o freelancer. Dê uma nota de 1 a 5 estrelas e deixe um comentário sobre a experiência.",
  },
  {
    id: 4,
    question: "Posso cancelar um evento?",
    answer:
      "Sim, é possível cancelar um evento antes da data de realização. Acesse os detalhes da vaga e toque em \"Cancelar Vaga\". Verifique os termos de cancelamento para entender eventuais penalidades.",
  },
  {
    id: 5,
    question: "Como aceitar ou recusar candidatos?",
    answer:
      "Na tela de detalhes de uma vaga aberta, você encontra a lista de candidatos. Toque em um candidato para ver o perfil completo e escolha \"Aceitar\" ou \"Recusar\".",
  },
  {
    id: 6,
    question: "O que é uma proposta exclusiva?",
    answer:
      "Uma proposta exclusiva é enviada diretamente para um freelancer específico, sem abertura pública da vaga. É útil quando você já tem um profissional de confiança em mente.",
  },
];

type AccordionItemProps = {
  item: FaqItem;
  isOpen: boolean;
  onPress: () => void;
  showDivider: boolean;
};

function AccordionItem({ item, isOpen, onPress, showDivider }: AccordionItemProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.accordionRow}
        onPress={onPress}
        activeOpacity={0.7}
        testID={`faq-item-${item.id}`}
      >
        <Text style={styles.accordionQuestion}>{item.question}</Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color="#D1D5DB"
        />
      </TouchableOpacity>

      {isOpen && (
        <Text style={styles.accordionAnswer} testID={`faq-answer-${item.id}`}>
          {item.answer}
        </Text>
      )}

      {showDivider && <View style={styles.itemDivider} />}
    </>
  );
}

export default function AjudaScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [openItemId, setOpenItemId] = useState<number | null>(null);

  function handleAccordionPress(id: number) {
    setOpenItemId((prev) => (prev === id ? null : id));
  }

  function handleSupportPress() {
    Linking.openURL("https://wa.me/5511999999999");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBackOrReplace(router, "/(home)")}
          activeOpacity={0.7}
          style={styles.backButton}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Duvidas Frequentes</Text>
          </View>
          <View style={styles.divider} />

          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openItemId === item.id}
              onPress={() => handleAccordionPress(item.id)}
              showDivider={index < FAQ_ITEMS.length - 1}
            />
          ))}
        </View>

        <View style={[styles.card, styles.supportCard]}>
          <View style={styles.iconBubble}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.supportTitle}>Ainda precisa de ajuda?</Text>
          <Text style={styles.supportSubtitle}>
            Fale diretamente com nosso suporte pelo chat.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleSupportPress}
            activeOpacity={0.8}
            testID="support-button"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1A1A2E" />
            <Text style={styles.supportButtonLabel}>Chamar Suporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["2"],
    paddingBottom: spacing["2"],
    gap: spacing["3"],
  },
  backButton: {
    padding: spacing["2"],
    marginLeft: -spacing["2"],
  },
  headerTitle: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: "#1A1A2E",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["6"],
    gap: spacing["6"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingTop: spacing["8"],
    paddingBottom: spacing["2"],
    ...cardShadowStrong,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["6"],
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["6"],
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: "#1A1A2E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    width: "100%",
  },
  accordionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing["8"],
    paddingVertical: 13,
  },
  accordionQuestion: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: "#11181C",
    paddingRight: spacing["4"],
  },
  accordionAnswer: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["6"],
    lineHeight: 20,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginHorizontal: 0,
  },
  supportCard: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: spacing["8"],
    marginBottom: spacing["4"],
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF3DC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["6"],
  },
  supportTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: "#11181C",
    textAlign: "center",
    marginBottom: spacing["1"],
  },
  supportSubtitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing["8"],
  },
  supportButton: {
    width: "100%",
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["4"],
  },
  supportButtonLabel: {
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    color: "#1A1A2E",
  },
});
