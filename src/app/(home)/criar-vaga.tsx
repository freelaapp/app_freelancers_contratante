import { InfoBox } from "@/components/info-box";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ServiceChip } from "@/components/service-chip";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { SERVICES } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CriarVagaScreen() {
  const insets = useSafeAreaInsets();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dataEvento, setDataEvento] = useState("");
  const [noEstabelecimento, setNoEstabelecimento] = useState(true);
  const [descricao, setDescricao] = useState("");

  const toggleService = useCallback((id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handlePublish = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <PageHeader
        badge="Freela para Empresas"
        title="Nova contratação"
        subtitle="Monte seu evento selecionando os serviços que precisa"
        rounded
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Serviços necessários</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione os profissionais
          </Text>
          <View style={styles.chipsGrid}>
            {Array.from({ length: Math.ceil(SERVICES.length / 2) }, (_, i) => {
              const row = SERVICES.slice(i * 2, i * 2 + 2);
              return (
                <View key={i} style={styles.chipsRow}>
                  {row.map((service) => (
                    <ServiceChip
                      key={service.id}
                      emoji={service.emoji}
                      label={service.label}
                      selected={selectedServices.includes(service.id)}
                      onPress={() => toggleService(service.id)}
                    />
                  ))}
                  {row.length === 1 && <View style={styles.chipPlaceholder} />}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Data do evento</Text>
          </View>
          <Input
            placeholder="dd/mm/aaaa"
            keyboardType="numeric"
            icon="calendar-outline"
            value={dataEvento}
            onChangeText={setDataEvento}
            maxLength={10}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Local do evento</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>No seu estabelecimento?</Text>
            <Switch
              value={noEstabelecimento}
              onValueChange={setNoEstabelecimento}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Descrição da vaga</Text>
          </View>
          <Text style={styles.descSubtitle}>
            Descreva detalhes importantes para os freelancers
          </Text>
          <TextInput
            style={styles.descInput}
            multiline
            textAlignVertical="top"
            placeholder="Ex.: Preciso de 2 garçons para evento corporativo no sábado, das 18h às 23h. Traje social exigido. Experiência com serviço de mesa..."
            placeholderTextColor={colors.muted}
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        <InfoBox
          icon="information-circle-outline"
          title="Contratação"
          body="Você pode criar vagas 1 hora antes do início a 3 meses antes do início."
        />
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <PrimaryButton label="Publicar contratação →" onPress={handlePublish} />
      </View>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    gap: spacing["6"],
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    gap: spacing["6"],
    ...CARD_SHADOW,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  sectionSubtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginTop: -spacing["4"],
  },
  chipsGrid: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  chipPlaceholder: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing["3"],
  },
  toggleLabel: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  descSubtitle: {
    fontSize: fontSizes.xs + 2,
    color: colors.muted,
    marginTop: -spacing["4"],
  },
  descInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing["7"],
    height: 120,
    textAlignVertical: "top",
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["6"],
  },
});
