import { BottomActionBar } from "@/components/bottom-action-bar";
import { CardContainer } from "@/components/card-container";
import { CardHeader } from "@/components/card-header";
import { InfoBox } from "@/components/info-box";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ServiceChip } from "@/components/service-chip";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { vagasService } from "@/services/vagas.service";
import { toast } from "@/utils/toast";
import { SERVICES } from "@/utils/services";
import { getTarifa, ModuloTarifas, Tarifa } from "@/utils/tarifas";
import { criarVagaSchema, CriarVagaFormValues } from "@/validation/criar-vaga.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const minDate = new Date();
const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

type TarifaInfoProps = {
  tarifa: Tarifa;
};

function TarifaInfo({ tarifa }: TarifaInfoProps) {
  return (
    <View style={tarifaStyles.card} testID="tarifa-info-card">
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Valor por hora:</Text>
        <Text style={tarifaStyles.value}>R$ {tarifa.valorHora.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Jornada minima:</Text>
        <Text style={tarifaStyles.value}>{tarifa.jornadaMinima}h</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.label}>Total minimo:</Text>
        <Text style={tarifaStyles.value}>R$ {tarifa.valorTotal.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.separator} />
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.labelSmall}>Taxa da plataforma (20%):</Text>
        <Text style={tarifaStyles.valueSmall}>R$ {tarifa.taxaRetencao.toFixed(2)}</Text>
      </View>
      <View style={tarifaStyles.row}>
        <Text style={tarifaStyles.labelSmall}>Freelancer recebe:</Text>
        <Text style={tarifaStyles.valueGreen}>R$ {tarifa.freelancerRecebe.toFixed(2)}</Text>
      </View>
    </View>
  );
}

type DatePickerFieldProps = {
  value: string;
  error?: string;
  testID?: string;
  onConfirm: (date: Date) => void;
};

function DatePickerField({ value, error, testID, onConfirm }: DatePickerFieldProps) {
  const [showIOS, setShowIOS] = useState(false);
  const [pickerValue, setPickerValue] = useState<Date>(minDate);
  const pendingDateRef = useRef<Date>(minDate);

  function openPicker() {
    const initial = value ? parseDisplayDate(value) : minDate;
    pendingDateRef.current = initial;
    setPickerValue(initial);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: initial,
        minimumDate: minDate,
        maximumDate: maxDate,
        onChange: (_e, date) => {
          if (date) onConfirm(date);
        },
      });
    } else {
      setShowIOS((prev) => !prev);
    }
  }

  function handleConfirm() {
    onConfirm(pendingDateRef.current);
    setShowIOS(false);
  }

  return (
    <View style={dateStyles.wrapper}>
      <TouchableOpacity
        testID={testID}
        style={[dateStyles.container, error ? dateStyles.containerError : dateStyles.containerDefault]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.muted} style={dateStyles.icon} />
        <Text style={[dateStyles.input, value ? dateStyles.text : dateStyles.placeholder]}>
          {value || "Selecione a data"}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={dateStyles.error}>{error}</Text> : null}

      {Platform.OS === "ios" && showIOS && (
        <View style={dateStyles.inlinePicker}>
          <DateTimePicker
            mode="date"
            display="spinner"
            value={pickerValue}
            minimumDate={minDate}
            maximumDate={maxDate}
            locale="pt-BR"
            style={{ height: 216, width: "100%" }}
            onChange={(_e, date) => {
              if (date) pendingDateRef.current = date;
            }}
          />
          <View style={dateStyles.toolbar}>
            <TouchableOpacity onPress={() => setShowIOS(false)}>
              <Text style={dateStyles.toolbarCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={dateStyles.toolbarConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

type TimePickerFieldProps = {
  label: string;
  value: string;
  error?: string;
  testID?: string;
  onConfirm: (time: string) => void;
};

function TimePickerField({ label, value, error, testID, onConfirm }: TimePickerFieldProps) {
  // raw holds only the hour digits the user is typing (max 2 chars)
  const [raw, setRaw] = useState(() => (value ? value.split(":")[0] : ""));
  const lastCommitted = useRef(value);

  // sync when parent resets the field externally
  if (lastCommitted.current !== value) {
    lastCommitted.current = value;
    const synced = value ? value.split(":")[0] : "";
    if (synced !== raw) setRaw(synced);
  }

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 2);
    const h = parseInt(digits || "0", 10);
    if (digits.length === 2 && h > 23) return;
    setRaw(digits);
    if (digits.length === 2) {
      const committed = `${digits}:00`;
      lastCommitted.current = committed;
      onConfirm(committed);
    } else if (digits.length === 0) {
      lastCommitted.current = "";
      onConfirm("");
    }
  }

  function handleBlur() {
    if (raw.length === 1) {
      const padded = raw.padStart(2, "0");
      const committed = `${padded}:00`;
      setRaw(padded);
      lastCommitted.current = committed;
      onConfirm(committed);
    }
  }

  return (
    <View style={dateStyles.wrapper}>
      <Text style={timeStyles.label}>{label}</Text>
      <View style={[dateStyles.container, error ? dateStyles.containerError : dateStyles.containerDefault]}>
        <Ionicons name="time-outline" size={20} color={colors.muted} style={dateStyles.icon} />
        <TextInput
          testID={testID}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="00"
          placeholderTextColor={colors.muted}
          value={raw}
          onChangeText={handleChange}
          onBlur={handleBlur}
          style={[dateStyles.input, { flex: 1 }]}
        />
        <Text style={[dateStyles.text, { marginRight: spacing["2"] }]}>:00</Text>
      </View>
      {error ? <Text style={dateStyles.error}>{error}</Text> : null}
    </View>
  );
}

function parseDisplayDate(display: string): Date {
  const [day, month, year] = display.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function CriarVagaScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { control, handleSubmit, setValue, watch, setError } = useForm<CriarVagaFormValues>({
    resolver: yupResolver(criarVagaSchema),
    defaultValues: {
      selectedServices: [],
      dataEvento: "",
      horarioInicio: "",
      horarioFim: "",
      endereco: "",
      descricao: "",
    },
  });

  const [noEstabelecimento, setNoEstabelecimento] = useState(true);
  const [loading, setLoading] = useState(false);

  const selectedServices = watch("selectedServices");

  const tarifaAtual = useMemo<Tarifa | null>(() => {
    if (!user?.module || selectedServices?.length !== 1) return null;
    return getTarifa(user.module as ModuloTarifas, selectedServices[0]) ?? null;
  }, [user?.module, selectedServices]);

  const toggleService = useCallback(
    (id: string) => {
      const current = selectedServices ?? [];
      const next = current.includes(id)
        ? current.filter((s) => s !== id)
        : [...current, id];
      setValue("selectedServices", next, { shouldValidate: true });
    },
    [selectedServices, setValue]
  );

  async function handlePublish(data: CriarVagaFormValues) {
    if (!noEstabelecimento && !data.endereco?.trim()) {
      setError("endereco", { message: "Endereço é obrigatório" });
      return;
    }

    if (!user?.module || !user?.contractorId) return;

    if (tarifaAtual) {
      const [inicioh, iniciom] = data.horarioInicio.split(":").map(Number);
      const [fimh, fimm] = data.horarioFim.split(":").map(Number);
      const duracaoHoras = (fimh * 60 + fimm - (inicioh * 60 + iniciom)) / 60;
      if (duracaoHoras < tarifaAtual.jornadaMinima) {
        setError("horarioFim", {
          message: `Jornada minima para este servico e de ${tarifaAtual.jornadaMinima}h`,
        });
        return;
      }
    }

    const [day, month, year] = data.dataEvento.split("/");
    const dateISO = `${year}-${month}-${day}`;

    const toISO = (date: string, time: string) => `${date}T${time}:00.000Z`;

    const serviceType = SERVICES.find((s) => s.id === data.selectedServices[0])?.label ?? "";

    const address = noEstabelecimento ? undefined : data.endereco;

    const payload = {
      title: serviceType,
      description: data.descricao,
      serviceType,
      date: dateISO,
      startTime: toISO(dateISO, data.horarioInicio),
      endTime: toISO(dateISO, data.horarioFim),
      address,
    };

    try {
      setLoading(true);
      console.log("[criar-vaga] enviando payload:", JSON.stringify(payload));
      await vagasService.create(user.module as "home-services" | "bars-restaurants", payload);
      console.log("[criar-vaga] vaga criada com sucesso");
      toast.success("Vaga publicada com sucesso!");
      router.back();
    } catch (err) {
      console.error("[criar-vaga] erro ao criar:", err);
      toast.error("Erro ao publicar a vaga. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

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
        <Controller
          control={control}
          name="selectedServices"
          render={({ fieldState }) => (
            <CardContainer>
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
                          selected={(selectedServices ?? []).includes(service.id)}
                          onPress={() => toggleService(service.id)}
                        />
                      ))}
                      {row.length === 1 && <View style={styles.chipPlaceholder} />}
                    </View>
                  );
                })}
              </View>
              {tarifaAtual && <TarifaInfo tarifa={tarifaAtual} />}
              {fieldState.error?.message && (
                <Text style={styles.fieldError}>{fieldState.error.message}</Text>
              )}
            </CardContainer>
          )}
        />

        <CardContainer>
          <CardHeader icon="calendar-outline" title="Data do evento" />
          <Controller
            control={control}
            name="dataEvento"
            render={({ field: { value }, fieldState }) => (
              <DatePickerField
                testID="date-picker-button"
                value={value}
                error={fieldState.error?.message}
                onConfirm={(date) =>
                  setValue("dataEvento", formatDateDisplay(date), { shouldValidate: true })
                }
              />
            )}
          />
        </CardContainer>

        <CardContainer>
          <CardHeader icon="time-outline" title="Horário do evento" />
          <Controller
            control={control}
            name="horarioInicio"
            render={({ field: { value }, fieldState }) => (
              <TimePickerField
                testID="time-inicio-button"
                label="Horário de início"
                value={value}
                error={fieldState.error?.message}
                onConfirm={(time) => setValue("horarioInicio", time, { shouldValidate: true })}
              />
            )}
          />
          <Controller
            control={control}
            name="horarioFim"
            render={({ field: { value }, fieldState }) => (
              <TimePickerField
                testID="time-fim-button"
                label="Horário de encerramento"
                value={value}
                error={fieldState.error?.message}
                onConfirm={(time) => setValue("horarioFim", time, { shouldValidate: true })}
              />
            )}
          />
        </CardContainer>

        <CardContainer>
          <CardHeader icon="location-outline" title="Local do evento" />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>No seu estabelecimento?</Text>
            <Switch
              testID="toggle-estabelecimento"
              value={noEstabelecimento}
              onValueChange={setNoEstabelecimento}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {!noEstabelecimento && (
            <Controller
              control={control}
              name="endereco"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
                  placeholder="Rua, número, bairro..."
                  icon="location-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}
        </CardContainer>

        <CardContainer>
          <CardHeader icon="document-text-outline" title="Descrição da vaga" />
          <Text style={styles.descSubtitle}>
            Descreva detalhes importantes para os freelancers
          </Text>
          <Controller
            control={control}
            name="descricao"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <>
                <TextInput
                  style={[
                    styles.descInput,
                    fieldState.error ? styles.descInputError : null,
                  ]}
                  multiline
                  textAlignVertical="top"
                  placeholder="Ex.: Preciso de 2 garçons para evento corporativo no sábado, das 18h às 23h. Traje social exigido. Experiência com serviço de mesa..."
                  placeholderTextColor={colors.muted}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {fieldState.error?.message && (
                  <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                )}
              </>
            )}
          />
        </CardContainer>

        <InfoBox
          icon="information-circle-outline"
          title="Contratação"
          body="Você pode criar vagas 1 hora antes do início a 3 meses antes do início."
        />
      </ScrollView>

      <BottomActionBar backgroundColor={colors.white} showTopBorder>
        <PrimaryButton
          label="Publicar contratação →"
          onPress={handleSubmit(handlePublish)}
          loading={loading}
        />
      </BottomActionBar>
    </View>
  );
}

const tarifaStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing["7"],
    gap: spacing["4"],
    marginTop: spacing["4"],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: fontSizes.base,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  value: {
    fontSize: fontSizes.base,
    color: colors.ink,
    fontWeight: fontWeights.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing["2"],
  },
  labelSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  valueSmall: {
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  valueGreen: {
    fontSize: fontSizes.sm,
    color: "#16A34A",
    fontWeight: fontWeights.semibold,
  },
});

const dateStyles = StyleSheet.create({
  wrapper: {
    gap: spacing["3"],
  },
  container: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["7"],
  },
  containerDefault: {
    borderColor: colors.border,
  },
  containerError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing["5"],
  },
  text: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  placeholder: {
    color: colors.muted,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.error,
  },
  inlinePicker: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing["2"],
    overflow: "hidden",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["7"],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarCancel: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  toolbarConfirm: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
});

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
  descInputError: {
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing["3"],
  },
});

const timeStyles = StyleSheet.create({
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
});
