import { BottomActionBar } from "@/components/bottom-action-bar";
import { Input } from "@/components/input";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { EnderecoCompleto } from "@/hooks/use-via-cep";
import { vagasService } from "@/services/vagas.service";
import { setPendingVaga } from "@/utils/pending-vaga-store";
import { toast } from "@/utils/toast";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EnderecoForm } from "./endereco-form";
import { formatCEP, formatEnderecoDisplay, useViaCep } from "@/hooks/use-via-cep";

export type Step4Props = {
  dataEvento: string;
  selectedServices: string[];
  horarioInicio: string;
  horarioFim: string;
  noEstabelecimento: boolean;
  endereco: EnderecoCompleto;
  descricao: string;
  onNoEstabelecimentoChange: (value: boolean) => void;
  onEnderecoChange: (value: EnderecoCompleto) => void;
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

  const {
    loading: cepLoading,
    error: cepError,
    buscarCep,
    reset: resetCep,
  } = useViaCep();

  const handleBuscarCep = async (cep: string) => {
    const result = await buscarCep(cep);
    if (result) {
      onEnderecoChange(result);
    }
  };

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

    try {
      const vagasExistentes = await vagasService.listByContractor(
        user.module as "home-services" | "bars-restaurants",
        user.contractorId
      );

      const [d, m, y] = dataEvento.split("/");
      const dateISO = `${y}-${m}-${d}`;

      const newStart = parseInt(horarioInicio.split(":")[0], 10);
      const newEnd = parseInt(horarioFim.split(":")[0], 10);

      const STATUS_FINALIZADOS = ["finished", "completed", "done", "cancelled", "canceled", "concluida", "cancelada"];

      const conflito = vagasExistentes.find((vaga) => {
        if (!vaga.startTime || !vaga.endTime) return false;
        if (STATUS_FINALIZADOS.includes(String(vaga.status).toLowerCase())) return false;

        const vagaDate = vaga.startTime.substring(0, 10);
        if (vagaDate !== dateISO) return false;

        const vagaStart = parseInt(vaga.startTime.substring(11, 13), 10);
        const vagaEnd = parseInt(vaga.endTime.substring(11, 13), 10);

        return newStart < vagaEnd && newEnd > vagaStart;
      });

      if (conflito) {
        toast.error(
          "Você já possui uma vaga ativa nesse horário. Aguarde o término antes de criar outra."
        );
        return;
      }
    } catch {
      // ignora falha na verificação de conflito — não bloqueia o submit
    }

    if (!noEstabelecimento) {
      const { cep, rua, numero, bairro, cidade, uf } = endereco;
      if (!cep || !rua || !numero || !bairro || !cidade || !uf) {
        toast.error("Endereço completo é obrigatório");
        return;
      }
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

    const toISOWithBrazilOffset = (date: string, time: string): string => {
      const [h, m] = time.split(":").map(Number);
      const localDate = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      return localDate.toISOString();
    };

    const formatAddressString = () => {
      if (noEstabelecimento) return undefined;
      const { rua, numero, complemento, bairro, cidade, uf } = endereco;
      let address = `${rua}, ${numero}`;
      if (complemento) address += `, ${complemento}`;
      address += `, ${bairro}, ${cidade}/${uf}`;
      return address;
    };

    const payload = {
      title: serviceLabel,
      description: descricao,
      serviceType: serviceLabel.toUpperCase(),
      date: dateISO,
      startTime: toISOWithBrazilOffset(dateISO, horarioInicio),
      endTime: toISOWithBrazilOffset(dateISO, horarioFim),
      address: formatAddressString(),
      ...(!noEstabelecimento && endereco.cidade ? { cityId: endereco.cidade } : {}),
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
        <View style={styles.summaryCard}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceEmojiContainer}>
              <Text style={styles.serviceEmoji}>{serviceEmoji}</Text>
            </View>
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
              value={formatEnderecoDisplay(endereco)}
            />
          )}
        </View>

        {tarifa && (() => {
            // Calcular duração em horas
            const [inicioh, iniciom] = horarioInicio.split(":").map(Number);
            const [fimh, fimm] = horarioFim.split(":").map(Number);
            const duracaoHoras = (fimh * 60 + fimm - (inicioh * 60 + iniciom)) / 60;
            const horasTrabalho = Math.max(duracaoHoras, tarifa.jornadaMinima);
            
            // Calcular valores baseados na duração
            // A tarifa tem valores calculados para a jornada mínima, então proporcionalizamos
            const fator = horasTrabalho / tarifa.jornadaMinima;
            const valorTotal = tarifa.valorTotal * fator;
            const taxaPlataforma = tarifa.taxaRetencao * fator;
            const repasseFreelancer = tarifa.freelancerRecebe * fator;
            
            return (
              <View style={styles.tarifaCard}>
                <View style={styles.tarifaCardHeader}>
                  <Ionicons name="cash-outline" size={16} color={colors.primary} />
                  <Text style={styles.tarifaTitle}>Estimativa de custo</Text>
                </View>
                <View style={styles.tarifaRow}>
                  <Text style={styles.tarifaLabel}>Valor total</Text>
                  <Text style={styles.tarifaValue}>R$ {valorTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.tarifaRow}>
                  <Text style={styles.tarifaLabelSmall}>Taxas (20%)</Text>
                  <Text style={styles.tarifaValueSmall}>R$ {taxaPlataforma.toFixed(2)}</Text>
                </View>
                <View style={styles.tarifaSeparator} />
                <View style={styles.tarifaRow}>
                  <Text style={styles.tarifaLabelHighlight}>Repasse ao Freelancer</Text>
                  <View style={styles.tarifaValueHighlightContainer}>
                    <Text style={styles.tarifaValueHighlight}>R$ {repasseFreelancer.toFixed(2)}</Text>
                    <View style={styles.tarifaGuaranteeBadge}>
                      <Text style={styles.tarifaGuaranteeText}>Garantido</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })()}

        <View style={[styles.locationSection, styles.card]}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
            </View>
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
            <EnderecoForm
              endereco={endereco}
              onEnderecoChange={onEnderecoChange}
              onBuscarCep={handleBuscarCep}
              loading={cepLoading}
              error={cepError}
            />
          )}
        </View>

        <View style={[styles.descSection, styles.card]}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            </View>
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
            onChangeText={onDescricaoChange}
          />
          <Text style={[styles.charCount, descricao.length < 20 ? styles.charCountError : styles.charCountOk]}>
            {descricao.length} caracteres{descricao.length < 20 ? ` (mínimo 20)` : ""}
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar backgroundColor={colors.white} showTopBorder>
        <TouchableOpacity
          style={[styles.publishButton, loading && styles.publishButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <Text style={styles.publishButtonText}>Publicando...</Text>
          ) : (
            <>
              <Ionicons name="rocket-outline" size={18} color={colors.white} />
              <Text style={styles.publishButtonText}>Publicar vaga</Text>
            </>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["6"],
    gap: spacing["6"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing["8"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing["8"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    marginBottom: spacing["5"],
    paddingBottom: spacing["4"],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  serviceEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceEmoji: {
    fontSize: 36,
  },
  serviceLabel: {
    fontSize: fontSizes.lg + 1,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    flex: 1,
  },
  tarifaCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: spacing["8"],
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  tarifaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    marginBottom: spacing["6"],
  },
  tarifaTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  tarifaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["3"],
  },
  tarifaLabel: {
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  tarifaValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  tarifaLabelSmall: {
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
  tarifaValueSmall: {
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
  tarifaSeparator: {
    height: 1,
    backgroundColor: colors.primary + "33",
    marginVertical: spacing["5"],
  },
  tarifaLabelHighlight: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: "#16A34A",
  },
  tarifaValueHighlightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  tarifaValueHighlight: {
    fontSize: fontSizes.lg - 1,
    fontWeight: fontWeights.bold,
    color: "#16A34A",
  },
  tarifaGuaranteeBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["1"],
  },
  tarifaGuaranteeText: {
    fontSize: fontSizes.xs,
    color: "#16A34A",
    fontWeight: fontWeights.medium,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    marginBottom: spacing["6"],
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  locationSection: {
    marginTop: 0,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["5"],
    marginBottom: spacing["4"],
  },
  toggleLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  descSection: {
    marginTop: 0,
  },
  descSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.muted,
    marginBottom: spacing["4"],
  },
  descInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    height: 130,
    textAlignVertical: "top",
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  charCount: {
    fontSize: fontSizes.sm,
    textAlign: "right",
    marginTop: spacing["2"],
  },
  charCountError: {
    color: colors.error,
  },
  charCountOk: {
    color: colors.muted,
  },
  publishButton: {
    backgroundColor: "#16A34A",
    borderRadius: radii.lg,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["4"],
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
});

const summaryStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFBEB",
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