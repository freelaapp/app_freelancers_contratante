import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";
import { PhotoUpload } from "@/components/photo-upload";
import { PrimaryButton } from "@/components/primary-button";
import { SelectField } from "@/components/select-field";
import { TabSelector } from "@/components/tab-selector";
import { useAuth } from "@/context/auth-context";
import { CepNotFoundError, fetchAddressByCep } from "@/services/viacep";
import { contractorService } from "@/services/contractor.service";
import { toast } from "@/utils/toast";
import { completarCadastroSchema, CompletarCadastroFormValues } from "@/validation/completar-cadastro.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
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

type TabPrincipal = "casa" | "empresas";
type TabDocumento = "cpf" | "cnpj";

const TAB_PRINCIPAL_OPTIONS = [
  { label: "Freela em Casa", value: "casa" },
  { label: "Freela para Empresas", value: "empresas" },
];

const TAB_DOCUMENTO_OPTIONS = [
  { label: "CPF", value: "cpf" },
  { label: "CNPJ", value: "cnpj" },
];

export default function CompletarCadastroScreen() {
  const router = useRouter();
  const { completeProfile } = useAuth();
  const { bottom } = useSafeAreaInsets();

  const [tabDocumento, setTabDocumento] = useState<TabDocumento>("cpf");
  const [cepLoading, setCepLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, setError, clearErrors } = useForm<CompletarCadastroFormValues>({
    resolver: yupResolver(completarCadastroSchema) as Resolver<CompletarCadastroFormValues>,
    defaultValues: {
      tabPrincipal: "casa",
      documento: "",
      celular: "",
      dataNascimento: "",
      cep: "",
      estado: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      complemento: "",
      cnpjEmpresa: "",
      razaoSocial: "",
      ramoEstabelecimento: "",
      nomeEstabelecimento: "",
      celularEmpresa: "",
      nomeResponsavel: "",
      telefoneResponsavel: "",
      foto1: "",
      foto2: "",
    },
  });

  const tabPrincipal = watch("tabPrincipal");

  async function fetchCep(raw: string) {
    setCepLoading(true);
    clearErrors("cep");
    try {
      const data = await fetchAddressByCep(raw);
      setValue("rua", data.logradouro ?? "");
      setValue("bairro", data.bairro ?? "");
      setValue("cidade", data.localidade ?? "");
      setValue("estado", data.uf ?? "");
    } catch (err) {
      setError("cep", {
        message: err instanceof CepNotFoundError ? "CEP não encontrado" : "Erro ao buscar CEP",
      });
    } finally {
      setCepLoading(false);
    }
  }

  function handleCepChange(value: string, rhfOnChange: (v: string) => void) {
    rhfOnChange(value);
    clearErrors("cep");
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) fetchCep(value);
  }

  function toDigits(v?: string) {
    return v?.replace(/\D/g, "") ?? undefined;
  }

  function toBirthDate(v?: string) {
    if (!v) return undefined;
    const [day, month, year] = v.split("/");
    return `${year}-${month}-${day}`;
  }

  async function handleSubmitForm(data: CompletarCadastroFormValues) {
    try {
      await contractorService.create({
        document: toDigits(data.documento),
        phone: toDigits(data.celular),
        birthDate: toBirthDate(data.dataNascimento),
        zipCode: toDigits(data.cep),
        state: data.estado,
        street: data.rua,
        number: data.numero,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.cidade,
        cnpj: toDigits(data.cnpjEmpresa),
        companyName: data.razaoSocial,
        businessType: data.ramoEstabelecimento,
        establishmentName: data.nomeEstabelecimento,
        companyPhone: toDigits(data.celularEmpresa),
        responsibleName: data.nomeResponsavel,
        responsiblePhone: toDigits(data.telefoneResponsavel),
      });
      toast.success("Cadastro completado!");
      completeProfile();
      router.replace("/(home)");
    } catch {
      // erro tratado pelo interceptor
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CompactHeader
        title="Completar cadastro"
        subtitle="Preencha seus dados para começar a contratar"
      />

      <ScrollView
        style={styles.card}
        contentContainerStyle={[
          styles.cardContent,
          { paddingBottom: Math.max(bottom, spacing["10"]) + spacing["8"] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="tabPrincipal"
          render={({ field: { onChange, value } }) => (
            <TabSelector
              options={TAB_PRINCIPAL_OPTIONS}
              value={value}
              onChange={(v) => onChange(v as TabPrincipal)}
            />
          )}
        />

        {tabPrincipal === "casa" && (
          <>
            <Text style={styles.sectionLabel}>DADOS PESSOAIS</Text>

            <TabSelector
              options={TAB_DOCUMENTO_OPTIONS}
              value={tabDocumento}
              onChange={(v) => setTabDocumento(v as TabDocumento)}
            />

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="documento"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Número do documento"
                    icon="document-text-outline"
                    placeholder={tabDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0001-00"}
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="celular"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Celular"
                    icon="call-outline"
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="dataNascimento"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Data de nascimento"
                    icon="calendar-outline"
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <Text style={styles.sectionLabel}>ENDEREÇO</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={styles.rowFlex}>
                <Controller
                  control={control}
                  name="cep"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <Input
                      label="CEP"
                      placeholder="00000-000"
                      keyboardType="numeric"
                      value={value}
                      onChangeText={(v) => handleCepChange(v, onChange)}
                      onBlur={onBlur}
                      error={fieldState.error?.message}
                      rightElement={
                        cepLoading
                          ? <ActivityIndicator size="small" color={colors.primary} />
                          : undefined
                      }
                    />
                  )}
                />
              </View>
              <Controller
                control={control}
                name="estado"
                render={({ field: { value }, fieldState }) => (
                  <SelectField
                    label="Estado"
                    placeholder="UF"
                    value={value || undefined}
                    onPress={() => {}}
                    error={fieldState.error?.message}
                    style={styles.estadoField}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="rua"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Rua"
                    icon="location-outline"
                    placeholder="Nome da rua"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Controller
                control={control}
                name="numero"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Número"
                    placeholder="123"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    containerStyle={styles.numeroContainer}
                  />
                )}
              />
              <View style={styles.rowFlex}>
                <Controller
                  control={control}
                  name="complemento"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Complemento"
                      placeholder="Apto, sala..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="bairro"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Bairro"
                    placeholder="Bairro"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="cidade"
                render={({ field: { value }, fieldState }) => (
                  <SelectField
                    label="Cidade"
                    placeholder="Selecione a cidade"
                    value={value || undefined}
                    onPress={() => {}}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          </>
        )}

        {tabPrincipal === "empresas" && (
          <>
            <Text style={styles.sectionLabel}>DADOS DA EMPRESA</Text>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="cnpjEmpresa"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="CNPJ"
                    icon="document-text-outline"
                    placeholder="00.000.000/0001-00"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="razaoSocial"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Razão Social"
                    placeholder="Nome da empresa"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="ramoEstabelecimento"
                render={({ field: { value }, fieldState }) => (
                  <SelectField
                    label="Ramo do estabelecimento"
                    placeholder="Selecione o ramo"
                    value={value || undefined}
                    onPress={() => {}}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="nomeEstabelecimento"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Nome do estabelecimento"
                    icon="storefront-outline"
                    placeholder="Nome fantasia"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="celularEmpresa"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Celular"
                    icon="call-outline"
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <Text style={styles.sectionLabel}>Fotos do estabelecimento</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Controller
                control={control}
                name="foto1"
                render={({ field: { onChange, value } }) => (
                  <PhotoUpload uri={value || undefined} onChange={onChange} />
                )}
              />
              <Controller
                control={control}
                name="foto2"
                render={({ field: { onChange, value } }) => (
                  <PhotoUpload uri={value || undefined} onChange={onChange} />
                )}
              />
            </View>

            <Text style={styles.sectionLabel}>ENDEREÇO</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={styles.rowFlex}>
                <Controller
                  control={control}
                  name="cep"
                  render={({ field: { onChange, onBlur, value }, fieldState }) => (
                    <Input
                      label="CEP"
                      placeholder="00000-000"
                      keyboardType="numeric"
                      value={value}
                      onChangeText={(v) => handleCepChange(v, onChange)}
                      onBlur={onBlur}
                      error={fieldState.error?.message}
                      rightElement={
                        cepLoading
                          ? <ActivityIndicator size="small" color={colors.primary} />
                          : undefined
                      }
                    />
                  )}
                />
              </View>
              <Controller
                control={control}
                name="estado"
                render={({ field: { value }, fieldState }) => (
                  <SelectField
                    label="Estado"
                    placeholder="UF"
                    value={value || undefined}
                    onPress={() => {}}
                    error={fieldState.error?.message}
                    style={styles.estadoField}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="rua"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Rua"
                    icon="location-outline"
                    placeholder="Nome da rua"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Controller
                control={control}
                name="numero"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Número"
                    placeholder="123"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                    containerStyle={styles.numeroContainer}
                  />
                )}
              />
              <View style={styles.rowFlex}>
                <Controller
                  control={control}
                  name="complemento"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Complemento"
                      placeholder="Apto, sala..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="bairro"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Bairro"
                    placeholder="Bairro"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="cidade"
                render={({ field: { value }, fieldState }) => (
                  <SelectField
                    label="Cidade"
                    placeholder="Selecione a cidade"
                    value={value || undefined}
                    onPress={() => {}}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <Text style={styles.sectionLabel}>RESPONSÁVEL PELA OPERAÇÃO</Text>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="nomeResponsavel"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Nome e sobrenome"
                    icon="person-outline"
                    placeholder="Nome do responsável"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Controller
                control={control}
                name="telefoneResponsavel"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="Telefone do responsável"
                    icon="call-outline"
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          </>
        )}

        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Finalizar cadastro" onPress={handleSubmit(handleSubmitForm)} />
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
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
  },
  cardContent: {
    paddingHorizontal: spacing["12"],
    paddingTop: spacing["10"],
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: "uppercase",
    marginTop: spacing["10"],
    marginBottom: spacing["4"],
  },
  fieldSpacing: {
    marginTop: spacing["8"],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing["4"],
  },
  rowFlex: {
    flex: 1,
  },
  estadoField: {
    width: 72,
  },
  numeroContainer: {
    width: 80,
  },
  buttonSpacing: {
    marginTop: spacing["10"],
  },
});
