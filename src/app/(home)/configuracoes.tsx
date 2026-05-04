import { cardShadow, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  showInsetDivider?: boolean;
};

function ToggleRow({ icon, label, sublabel, value, onValueChange, showInsetDivider = true }: ToggleRowProps) {
  return (
    <>
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.rowIcon} />
        <View style={styles.rowLabelArea}>
          <Text style={styles.rowLabel}>{label}</Text>
          {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#D1D5DB", true: colors.primary }}
          thumbColor={colors.white}
          ios_backgroundColor="#D1D5DB"
        />
      </View>
      {showInsetDivider && <View style={styles.insetDivider} />}
    </>
  );
}

type TapRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showInsetDivider?: boolean;
};

function TapRow({ icon, label, onPress, showInsetDivider = true }: TapRowProps) {
  return (
    <>
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} style={styles.rowIcon} />
        <View style={styles.rowLabelArea}>
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      </TouchableOpacity>
      {showInsetDivider && <View style={styles.insetDivider} />}
    </>
  );
}

type SectionHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SubSectionLabel({ label }: { label: string }) {
  return <Text style={styles.subSectionLabel}>{label}</Text>;
}

type SettingsState = {
  novasCandidaturas: boolean;
  mensagensRecebidas: boolean;
  avaliacoesRecebidas: boolean;
  pagamentosRealizados: boolean;
  receberEmail: boolean;
  notificacoesPush: boolean;
  perfilPublico: boolean;
  modoEscuro: boolean;
};

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<SettingsState>({
    novasCandidaturas: true,
    mensagensRecebidas: true,
    avaliacoesRecebidas: true,
    pagamentosRealizados: true,
    receberEmail: false,
    notificacoesPush: true,
    perfilPublico: true,
    modoEscuro: false,
  });

  function toggle(key: keyof SettingsState) {
    return (value: boolean) => setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    toast.success("Configurações salvas!");
  }

  function handleLegalItem(url: string) {
    Linking.openURL(url).catch(() => toast.info("Em breve"));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <SectionHeader icon="notifications-outline" title="Notificações" />
          <View style={styles.divider} />

          <ToggleRow
            icon="people-outline"
            label="Novas candidaturas em vagas"
            value={settings.novasCandidaturas}
            onValueChange={toggle("novasCandidaturas")}
          />
          <ToggleRow
            icon="chatbubble-outline"
            label="Mensagens recebidas"
            value={settings.mensagensRecebidas}
            onValueChange={toggle("mensagensRecebidas")}
          />
          <ToggleRow
            icon="star-outline"
            label="Avaliações recebidas"
            value={settings.avaliacoesRecebidas}
            onValueChange={toggle("avaliacoesRecebidas")}
          />
          <ToggleRow
            icon="cash-outline"
            label="Pagamentos realizados"
            value={settings.pagamentosRealizados}
            onValueChange={toggle("pagamentosRealizados")}
            showInsetDivider={false}
          />

          <SubSectionLabel label="CANAIS" />

          <ToggleRow
            icon="mail-outline"
            label="Receber por e-mail"
            value={settings.receberEmail}
            onValueChange={toggle("receberEmail")}
          />
          <ToggleRow
            icon="phone-portrait-outline"
            label="Notificações push"
            value={settings.notificacoesPush}
            onValueChange={toggle("notificacoesPush")}
            showInsetDivider={false}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader icon="shield-outline" title="Privacidade" />
          <View style={styles.divider} />
          <ToggleRow
            icon="globe-outline"
            label="Perfil público"
            sublabel="Freelancers podem ver seu perfil"
            value={settings.perfilPublico}
            onValueChange={toggle("perfilPublico")}
            showInsetDivider={false}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader icon="globe-outline" title="Preferências" />
          <View style={styles.divider} />
          <ToggleRow
            icon="moon-outline"
            label="Modo escuro"
            value={settings.modoEscuro}
            onValueChange={toggle("modoEscuro")}
            showInsetDivider={false}
          />
        </View>

        <View style={styles.card}>
          <SectionHeader icon="document-text-outline" title="Legal" />
          <View style={styles.divider} />
          <TapRow
            icon="document-outline"
            label="Termos de Uso"
            onPress={() => handleLegalItem("https://contratante.app/termos")}
          />
          <TapRow
            icon="lock-closed-outline"
            label="Política de Privacidade"
            onPress={() => handleLegalItem("https://contratante.app/privacidade")}
            showInsetDivider={false}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonLabel}>Salvar Configurações</Text>
        </TouchableOpacity>
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
    paddingTop: spacing["8"],
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
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing["6"],
    gap: spacing["6"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    marginHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    paddingBottom: spacing["2"],
    ...cardShadow,
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
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    width: "100%",
  },
  insetDivider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginLeft: 46,
  },
  subSectionLabel: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["4"],
    paddingBottom: spacing["2"],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["8"],
    paddingVertical: 13,
  },
  rowIcon: {
    width: 22,
    textAlign: "center",
  },
  rowLabelArea: {
    flex: 1,
    gap: spacing["3"],
    marginLeft: spacing["6"],
  },
  rowLabel: {
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: fontWeights.regular,
  },
  rowSublabel: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  saveButton: {
    marginHorizontal: spacing["8"],
    marginBottom: spacing["12"],
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonLabel: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.dark,
  },
});
