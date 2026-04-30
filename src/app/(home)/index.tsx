import { BookingCard, HomeHeader, PrimaryButton, SectionHeader } from "@/components";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HomeHeader userName={user?.name ?? "Usuário"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PrimaryButton
          label="Criar Vaga"
          onPress={() => router.push("/(home)/criar-vaga")}
        />

        <View style={styles.section}>
          <SectionHeader title="Próximas Contratações" icon="time-outline" />
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.sectionScroll}
            contentContainerStyle={styles.cardList}
          >
            <BookingCard
              title="Bartender - Festa Premium"
              location="Espaço Nobre"
              date="22 Fev 2026"
              time="20:00 - 03:00"
              value="R$300"
              status="confirmado"
            />
            <BookingCard
              title="Garçom - Casamento"
              location="Villa Real"
              date="24 Fev 2026"
              time="16:00 - 23:00"
              value="R$280"
              status="aguardando"
            />
            <BookingCard
              title="Bartender - Formatura"
              location="Clube Central"
              date="05 Mar 2026"
              time="19:00 - 01:00"
              value="R$350"
              status="aguardando"
            />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Minhas Vagas" icon="flash" />
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.sectionScroll}
            contentContainerStyle={styles.cardList}
          >
            <BookingCard
              title="Churrasqueiro - Aniversário 30 anos"
              location="Evento Privado"
              date="22 Fev 2026"
              time="14:00 - 22:00"
              value="R$650"
              status="confirmado"
            />
            <BookingCard
              title="Garçom - Evento Corporativo"
              location="Buffet Elegance"
              date="28 Fev 2026"
              time="18:00 - 23:00"
              value="R$320"
              status="aguardando"
            />
            <BookingCard
              title="Cozinheiro - Evento VIP"
              location="Hotel Grand"
              date="10 Mar 2026"
              time="12:00 - 20:00"
              value="R$480"
              status="confirmado"
            />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["10"],
    paddingBottom: spacing["12"],
  },
  section: {
    marginTop: spacing["12"],
    gap: spacing["6"],
  },
  sectionScroll: {
    maxHeight: 177,
  },
  cardList: {
    gap: spacing["6"],
  },
});
