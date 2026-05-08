import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { goBackOrReplace } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SectionProps = {
  title: string;
  body: string;
};

function Section({ title, body }: SectionProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

export default function TermosDeUsoScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => goBackOrReplace(router, "/(home)/configuracoes")}
          activeOpacity={0.7}
          style={styles.backButton}
          testID="back-button"
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.effectiveDate}>Data de vigência: 01 de janeiro de 2025</Text>

          <Section
            title="Introdução"
            body="Bem-vindo ao Freela Serviços. Ao utilizar nossa plataforma, você concorda com os presentes Termos de Uso. Leia atentamente antes de prosseguir. Caso não concorde com qualquer disposição, não utilize o aplicativo."
          />

          <Section
            title="1. Definições"
            body="Plataforma: o aplicativo Freela Serviços e seus serviços associados. Contratante: pessoa física ou jurídica que utiliza a plataforma para publicar vagas e contratar freelancers. Freelancer: profissional autônomo que oferece serviços por meio da plataforma. Vaga: anúncio de oportunidade de trabalho publicado por um Contratante. Proposta: oferta de prestação de serviço enviada por um Freelancer em resposta a uma Vaga."
          />

          <Section
            title="2. Cadastro e Conta"
            body="Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verídicas e atualizadas. Você é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. O Freela Serviços reserva-se o direito de suspender ou encerrar contas que violem estes Termos."
          />

          <Section
            title="3. Uso da Plataforma"
            body="O uso da plataforma é permitido apenas para fins lícitos. É vedado: (a) publicar conteúdo falso, enganoso ou ofensivo; (b) utilizar a plataforma para atividades ilegais; (c) tentar contornar os mecanismos de pagamento da plataforma; (d) assediar ou ameaçar outros usuários; (e) criar múltiplas contas para o mesmo usuário."
          />

          <Section
            title="4. Publicação de Vagas"
            body="O Contratante é responsável pelo conteúdo das vagas publicadas. As vagas devem descrever com precisão o serviço solicitado, a remuneração oferecida e quaisquer requisitos específicos. O Freela Serviços pode remover vagas que violem estes Termos ou que sejam consideradas inadequadas."
          />

          <Section
            title="5. Pagamentos e Taxas"
            body="Os pagamentos entre Contratantes e Freelancers são processados pela plataforma. O Freela Serviços cobra uma taxa de serviço sobre cada transação concluída, conforme tabela disponível no aplicativo. Os valores retidos são liberados ao Freelancer após a confirmação de conclusão do serviço pelo Contratante."
          />

          <Section
            title="6. Cancelamentos"
            body="O Contratante pode cancelar uma vaga antes da confirmação de um Freelancer sem penalidades. Cancelamentos após confirmação podem estar sujeitos a taxas conforme a política de cancelamento vigente, disponível no aplicativo."
          />

          <Section
            title="7. Avaliações"
            body="Após a conclusão de um serviço, Contratantes e Freelancers podem se avaliar mutuamente. As avaliações devem ser honestas e baseadas na experiência real. É vedado manipular o sistema de avaliações."
          />

          <Section
            title="8. Propriedade Intelectual"
            body="Todo o conteúdo da plataforma, incluindo marca, logotipo, design e software, é de propriedade exclusiva do Freela Serviços e está protegido pela legislação de propriedade intelectual vigente."
          />

          <Section
            title="9. Limitação de Responsabilidade"
            body="O Freela Serviços atua como intermediário entre Contratantes e Freelancers, não sendo parte das relações de trabalho ou prestação de serviços estabelecidas entre eles. A plataforma não se responsabiliza por danos decorrentes do descumprimento de acordos entre usuários."
          />

          <Section
            title="10. Alterações nos Termos"
            body="O Freela Serviços pode atualizar estes Termos a qualquer momento. Alterações significativas serão comunicadas com antecedência mínima de 30 dias. O uso contínuo da plataforma após as alterações implica aceitação dos novos Termos."
          />

          <Section
            title="11. Disposições Gerais"
            body="Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias. Para dúvidas, entre em contato pelo e-mail: suporte@freelaservicosapp.com.br"
          />

          <View style={styles.footerDivider} />
          <Text style={styles.footer}>
            Freela Serviços © 2025 · Todos os direitos reservados
          </Text>
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
    paddingBottom: spacing["12"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 20,
    ...cardShadowStrong,
  },
  effectiveDate: {
    fontSize: 12,
    color: "#687076",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    fontWeight: "400",
    color: "#3D3D3D",
    lineHeight: 22,
    marginBottom: 16,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginVertical: 8,
  },
  footer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
