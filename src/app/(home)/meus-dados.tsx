import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";
import { MaskedInput } from "@/components/masked-input";
import { PrimaryButton } from "@/components/primary-button";
import { cardShadow, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth.service";
import { contractorService } from "@/services/contractor.service";
import { toast } from "@/utils/toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as yup from "yup";

const CPF_MASK = [
  /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/,
];

const CNPJ_MASK = [
  /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/,
];

const PHONE_MASK = [
  "(", /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/,
];

type FormValues = {
  name: string;
  companyName: string;
  document: string;
  segment: string;
};

const schema = yup.object({
  name: yup.string().min(3, "Nome deve ter ao menos 3 caracteres").required("Nome é obrigatório"),
  companyName: yup.string().optional().default(""),
  document: yup.string().optional().default(""),
  segment: yup.string().optional().default(""),
});

type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <View style={styles.readOnlyWrapper}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <View style={styles.readOnlyContainer}>
        <Text style={styles.readOnlyValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

export default function MeusDadosScreen() {
  const { user } = useAuth();
  const { bottom } = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState("");

  const isBars = user?.module === "bars-restaurants";
  const isCasa = user?.module === "home-services";

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      companyName: "",
      document: "",
      segment: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const profileRes = await authService.getProfile();
        const profile = profileRes.data;

        const updates: Partial<FormValues> = {
          name: profile.name ?? user?.name ?? "",
        };

        setPhone(profile.phone ?? "");

        if (isBars && user?.contractorId) {
          const barsRes = await contractorService.getBarsById(user.contractorId);
          const barsData = (barsRes.data as unknown as { props?: typeof barsRes.data }).props ?? barsRes.data;
          updates.companyName = barsData.companyName ?? "";
          updates.document = barsData.document ?? "";
          updates.segment = barsData.segment ?? "";
        }

        if (isCasa && user?.contractorId) {
          const casaRes = await contractorService.getCasaById(user.contractorId);
          const casaData = (casaRes.data as unknown as { props?: typeof casaRes.data }).props ?? casaRes.data;
          updates.document = casaData.document ?? "";
        }

        reset(updates as FormValues);
      } catch {
        toast.error("Não foi possível carregar seus dados.", "Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.contractorId, isBars, isCasa]);

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    try {
      await authService.updateProfile({ name: values.name });

      if (isBars) {
        await contractorService.updateBars({
          companyName: values.companyName || undefined,
          document: values.document ? values.document.replace(/\D/g, "") : undefined,
          segment: values.segment || undefined,
        });
      }

      if (isCasa) {
        await contractorService.updateCasa({
          name: values.name || undefined,
          document: values.document ? values.document.replace(/\D/g, "") : undefined,
        });
      }

      toast.success("Dados atualizados com sucesso!");
    } catch {
      toast.error("Não foi possível salvar.", "Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <CompactHeader title="Meus Dados" subtitle="Gerencie suas informações" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CompactHeader title="Meus Dados" subtitle="Gerencie suas informações" />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottom, spacing["10"]) + spacing["8"] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>DADOS PESSOAIS</Text>

        <View style={[styles.card, styles.cardPadded]}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Nome completo"
                icon="person-outline"
                placeholder="Seu nome completo"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.fieldSpacing}>
            <ReadOnlyField label="E-mail" value={user?.email ?? ""} />
          </View>

          <View style={styles.fieldSpacing}>
            <View style={styles.readOnlyWrapper}>
              <Text style={styles.readOnlyLabel}>Telefone</Text>
              <MaskedInput
                label=""
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                mask={PHONE_MASK}
                maxLength={15}
                editable={false}
                containerStyle={styles.readOnlyContainer}
                style={styles.readOnlyValue}
              />
            </View>
          </View>
        </View>

        {isBars && (
          <>
            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
              DADOS DO ESTABELECIMENTO
            </Text>

            <View style={[styles.card, styles.cardPadded]}>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Nome do estabelecimento"
                    icon="storefront-outline"
                    placeholder="Nome fantasia"
                    value={value}
                    onChangeText={onChange}
                    error={errors.companyName?.message}
                    autoCapitalize="words"
                  />
                )}
              />

              <View style={styles.fieldSpacing}>
                <Controller
                  control={control}
                  name="document"
                  render={({ field: { value, onChange } }) => (
                    <MaskedInput
                      label="CNPJ"
                      icon="document-text-outline"
                      placeholder="00.000.000/0001-00"
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                      mask={CNPJ_MASK}
                      maxLength={18}
                      error={errors.document?.message}
                    />
                  )}
                />
              </View>

              <View style={styles.fieldSpacing}>
                <Controller
                  control={control}
                  name="segment"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Segmento"
                      icon="business-outline"
                      placeholder="Ex: Restaurante, Bar, Café..."
                      value={value}
                      onChangeText={onChange}
                      error={errors.segment?.message}
                      autoCapitalize="sentences"
                    />
                  )}
                />
              </View>
            </View>
          </>
        )}

        {isCasa && (
          <>
            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
              DADOS PESSOAIS DO ESTABELECIMENTO
            </Text>

            <View style={[styles.card, styles.cardPadded]}>
              <Controller
                control={control}
                name="document"
                render={({ field: { value, onChange } }) => (
                  <MaskedInput
                    label="CPF/Documento"
                    icon="document-text-outline"
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    mask={CPF_MASK}
                    maxLength={14}
                    error={errors.document?.message}
                  />
                )}
              />
            </View>
          </>
        )}

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label={isSaving ? "Salvando..." : "Salvar Alterações"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["10"],
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: spacing["4"],
  },
  sectionLabelSpaced: {
    marginTop: spacing["10"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    ...cardShadow,
  },
  cardPadded: {
    padding: spacing["8"],
  },
  fieldSpacing: {
    marginTop: spacing["8"],
  },
  readOnlyWrapper: {
    gap: spacing["3"],
  },
  readOnlyLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  readOnlyContainer: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.borderLight,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["7"],
  },
  readOnlyValue: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  buttonSpacing: {
    marginTop: spacing["10"],
  },
});
