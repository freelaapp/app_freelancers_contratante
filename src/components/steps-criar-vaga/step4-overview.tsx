import { BottomActionBar } from "@/components/bottom-action-bar";
import { Input } from "@/components/input";
import { PrimaryButton } from "@/components/primary-button";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { vagasService } from "@/services/vagas.service";
import { setPendingVaga } from "@/utils/pending-vaga-store";
import { toast } from "@/utils/toast";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Step4Props = {
  dataEvento: string;
  selectedServices: string[];
  horarioInicio: string;
  horarioFim: string;
  noEstabelecimento: boolean;
  endereco: string;
  descricao: string;
  onNoEstabelecimentoChange: (value: boolean) => void;
  onEnderecoChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
  onSuccess: () => void;
  modulo: ModuloTarifas | null;
};

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [day, month, year] = dateStr.split("/");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={summaryStyles.item}>
      <View style={summaryStyles.iconBox}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={summaryStyles.itemContent}>
        <Text style={summaryStyles.itemLabel}>{label}</Text>
        <Text style={summaryStyles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

export function Step4Overview({
  dataEvento,
  selectedServices,
  horarioInicio,
  horarioFim,
  noEstabelecimento,
  endereco,
  descricao,
  onNoEstabelecimentoChange,
  onEnderecoChange,
  onDescricaoChange,
  onSuccess,
  modulo,
}: Step4Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const serviceId = selectedServices[0];
  const serviceLabel = SERVICES.find((s) => s.id === serviceId)?.label ?? "";
  const serviceEmoji = SERVICES.find((s) => s.id === serviceId)?.emoji ?? "";
  const tarifa: Tarifa | undefined = serviceId && modulo ? getTarifa(modulo, serviceId) : undefined;

  const calculateDuration = () => {
    if (!horarioInicio || !horarioFim) return "";
    const [hi, mi] = horarioInicio.split(":").map(Number);
    const [hf, mf] = horarioFim.split(":").map(Number);
    const durationMinutes = hf * 60 + mf - (hi * 60 + mi);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const handleSubmit = async () => {
    if (!user?.module || !user?.contractorId) return;

    if (!noEstabelecimento && !endereco?.trim()) {
      toast.error("Endereço é obrigatório");
      return;
    }

    if (!descricao?.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (tarifa) {
      const [inicioh, iniciom] = horarioInicio.split(":").map(Number);
      const [fimh, fimm] = horarioFim.split(":").map(Number);
      const duracaoHoras = (fimh * 60 + fimm - (inicioh * 60 + iniciom)) / 60;
      if (duracaoHoras < tarifa.jornadaMinima) {
        toast.error(`Jornada mínima para este serviço é de ${tarifa.jornadaMinima}h`);
        return;
      }
    }

    const [day, month, year] = dataEvento.split("/");
    const dateISO = `${year}-${month}-${day}`;
    const toISO = (date: string, time: string) => `${date}T${time}:00.000Z`;

    const payload = {
      title: serviceLabel,
      description: descricao,
      serviceType: serviceLabel,
      date: dateISO,
      startTime: toISO(dateISO, horarioInicio),
      endTime: toISO(dateISO, horarioFim),
      address: noEstabelecimento ? undefined : endereco,
    };

    try {
      setLoading(true);
      const created = await vagasService.create(user.module as ModuloTarifas, payload);
      setPendingVaga(created);
      toast.success("Vaga publicada com sucesso!");
      onSuccess();
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(apiMessage ?? "Erro ao publicar a vaga. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Revise os detalhes</Text>
        <Text style={styles.subtitle}>
          Verifique se está tudo certo antes de publicar
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceEmoji}>{serviceEmoji}</Text>
            <Text style={styles.serviceLabel}>{serviceLabel}</Text>
          </View>

          <SummaryItem
            icon="calendar-outline"
            label="Data"
            value={formatDateForDisplay(dataEvento)}
          />
          <SummaryItem
            icon="time-outline"
            label="Horário"
            value={`${horarioInicio} às ${horarioFim}`}
          />
          <SummaryItem
            icon="timer-outline"
            label="Duração"
            value={calculateDuration()}
          />
          {!noEstabelecimento && (
            <SummaryItem
              icon="location-outline"
              label="Local"
              value={endereco}
            />
          )}
        </View>

        {tarifa && (
          <View style={styles.tarifaCard}>
            <Text style={styles.tarifaTitle}>Estimativa de custo</Text>
            <View style={styles.tarifaRow}>
              <Text style={styles.tarifaLabel}>Valor por hora</Text>
              <Text style={styles.tarifaValue}>R$ {tarifa.valorHora.toFixed(2)}</Text>
            </View>
            <View style={styles.tarifaRow}>
              <Text style={styles.tarifaLabel}>Taxa plataforma (20%)</Text>
              <Text style={styles.tarifaValueSmall}>R$ {tarifa.taxaRetencao.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Local do evento</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>No seu estabelecimento?</Text>
            <Switch
              value={noEstabelecimento}
              onValueChange={onNoEstabelecimentoChange}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {!noEstabelecimento && (
            <Input
              placeholder="Rua, número, bairro..."
              icon="location-outline"
              value={endereco}
              onChangeText={onEnderecoChange}
            />
          )}
        </View>

        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Descrição da vaga</Text>
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
            onChangeText={onDescricaoChange}
          />
        </View>
      </ScrollView>

      <BottomActionBar backgroundColor={colors.white} showTopBorder>
        <PrimaryButton
          label="Publicar contratação →"
          onPress={handleSubmit}
          loading={loading}
        />
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["6"],
    paddingTop: spacing["4"],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing["2"],
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginBottom: spacing["6"],
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing["6"],
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    marginBottom: spacing["5"],
    paddingBottom: spacing["4"],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceEmoji: {
    fontSize: 32,
  },
  serviceLabel: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  tarifaCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: radii.lg,
    padding: spacing["5"],
    marginTop: spacing["5"],
  },
  tarifaTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    marginBottom: spacing["3"],
  },
  tarifaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing["2"],
  },
  tarifaLabel: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  tarifaValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  tarifaValueSmall: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  locationSection: {
    marginTop: spacing["6"],
  },
  locationHeader: {
    marginBottom: spacing["4"],
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  toggleLabel: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  descSection: {
    marginTop: spacing["6"],
  },
  descSubtitle: {
    fontSize: fontSizes.xs + 2,
    color: colors.muted,
    marginBottom: spacing["4"],
  },
  descInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing["5"],
    height: 120,
    textAlignVertical: "top",
    fontSize: fontSizes.base,
    color: colors.ink,
  },
});

const summaryStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing["4"],
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: fontSizes.xs,
    color: colors.muted,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
});