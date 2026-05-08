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

export default function PoliticaDePrivacidadeScreen() {
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
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.effectiveDate}>
            Data de vigência: 01 de janeiro de 2025{"\n"}Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
          </Text>

          <Section
            title="Introdução"
            body="O Freela Serviços respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais. Esta Política descreve como coletamos, utilizamos, armazenamos e compartilhamos suas informações ao utilizar nossa plataforma."
          />

          <Section
            title="1. Dados Coletados"
            body="Coletamos os seguintes dados: (a) dados de cadastro: nome, e-mail, CPF/CNPJ, telefone e endereço; (b) dados de uso: registros de acesso, vagas publicadas, candidaturas e avaliações; (c) dados financeiros: informações necessárias para processamento de pagamentos (sem armazenamento de dados completos de cartão); (d) dados de dispositivo: modelo, sistema operacional, identificadores e informações de conexão; (e) dados de localização: apenas quando autorizado pelo usuário para funcionalidades específicas."
          />

          <Section
            title="2. Finalidade do Tratamento"
            body="Seus dados são utilizados para: (a) criar e gerenciar sua conta na plataforma; (b) intermediar a conexão entre Contratantes e Freelancers; (c) processar pagamentos e emitir comprovantes; (d) enviar notificações sobre sua conta e atividades; (e) melhorar continuamente a plataforma; (f) cumprir obrigações legais e regulatórias; (g) prevenir fraudes e garantir a segurança da plataforma."
          />

          <Section
            title="3. Compartilhamento de Dados"
            body="Seus dados podem ser compartilhados com: (a) outros usuários da plataforma, na medida necessária para viabilizar a prestação de serviços; (b) parceiros de pagamento, para processamento de transações financeiras; (c) autoridades competentes, quando exigido por lei ou decisão judicial; (d) prestadores de serviços técnicos que auxiliam na operação da plataforma, sob obrigações de confidencialidade. Não vendemos seus dados pessoais a terceiros."
          />

          <Section
            title="4. Armazenamento e Segurança"
            body="Seus dados são armazenados em servidores seguros com criptografia de dados em trânsito (TLS/SSL) e em repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição."
          />

          <Section
            title="5. Seus Direitos (LGPD)"
            body="Como titular de dados, você tem direito a: (a) confirmar a existência de tratamento de seus dados; (b) acessar seus dados pessoais; (c) corrigir dados incompletos, inexatos ou desatualizados; (d) solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; (e) solicitar a portabilidade dos dados; (f) revogar o consentimento a qualquer momento; (g) opor-se ao tratamento realizado com fundamento em legítimo interesse. Para exercer seus direitos, acesse as configurações do aplicativo ou entre em contato pelo e-mail: privacidade@freelaservicosapp.com.br"
          />

          <Section
            title="6. Cookies e Tecnologias Similares"
            body="Utilizamos tecnologias de rastreamento para melhorar a experiência do usuário, analisar o uso da plataforma e personalizar conteúdo. Você pode gerenciar suas preferências nas configurações do aplicativo."
          />

          <Section
            title="7. Retenção de Dados"
            body="Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta Política e para atender a obrigações legais. Dados de transações financeiras são retidos por 5 anos conforme exigência fiscal."
          />

          <Section
            title="8. Transferência Internacional"
            body="Alguns de nossos provedores de tecnologia estão localizados fora do Brasil. Nestes casos, garantimos que a transferência ocorre em conformidade com a LGPD e com os padrões de proteção de dados adequados."
          />

          <Section
            title="9. Menores de Idade"
            body="Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifiquemos tal situação, os dados serão excluídos imediatamente."
          />

          <Section
            title="10. Alterações nesta Política"
            body="Esta Política pode ser atualizada periodicamente. Notificaremos você sobre alterações significativas por meio do aplicativo ou por e-mail. Recomendamos revisá-la regularmente."
          />

          <Section
            title="11. Contato e Encarregado (DPO)"
            body="Para dúvidas, solicitações ou reclamações sobre privacidade, entre em contato: E-mail: privacidade@freelaservicosapp.com.br | Telefone: (11) 9999-9999 | Endereço: São Paulo, SP — Brasil."
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
    lineHeight: 18,
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
