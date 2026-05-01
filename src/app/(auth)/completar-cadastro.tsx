import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";
import { PhotoUpload } from "@/components/photo-upload";
import { PrimaryButton } from "@/components/primary-button";
import { SelectField } from "@/components/select-field";
import { TabSelector } from "@/components/tab-selector";
import { useAuth } from "@/context/auth-context";
import { CepNotFoundError, fetchAddressByCep } from "@/services/viacep";
import { useRouter } from "expo-router";
import { useState } from "react";
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

  const [tabPrincipal, setTabPrincipal] = useState<TabPrincipal>("casa");
  const [tabDocumento, setTabDocumento] = useState<TabDocumento>("cpf");

  const [documento, setDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");

  const [cnpjEmpresa, setCnpjEmpresa] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [ramoEstabelecimento, setRamoEstabelecimento] = useState("");
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [celularEmpresa, setCelularEmpresa] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [foto1, setFoto1] = useState("");
  const [foto2, setFoto2] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  async function fetchCep(raw: string) {
    setCepLoading(true);
    setCepError("");
    try {
      const data = await fetchAddressByCep(raw);
      setRua(data.logradouro ?? "");
      setBairro(data.bairro ?? "");
      setCidade(data.localidade ?? "");
      setEstado(data.uf ?? "");
    } catch (err) {
      setCepError(err instanceof CepNotFoundError ? "CEP não encontrado" : "Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  function handleCepChange(value: string) {
    setCep(value);
    setCepError("");
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) fetchCep(value);
  }

  function handleSubmit() {
    completeProfile();
    router.replace("/(home)");
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
        <TabSelector
          options={TAB_PRINCIPAL_OPTIONS}
          value={tabPrincipal}
          onChange={(v) => setTabPrincipal(v as TabPrincipal)}
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
              <Input
                label="Número do documento"
                icon="document-text-outline"
                placeholder={tabDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0001-00"}
                keyboardType="numeric"
                value={documento}
                onChangeText={setDocumento}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Celular"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={celular}
                onChangeText={setCelular}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Data de nascimento"
                icon="calendar-outline"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={dataNascimento}
                onChangeText={setDataNascimento}
              />
            </View>

            <Text style={styles.sectionLabel}>ENDEREÇO</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={styles.rowFlex}>
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  value={cep}
                  onChangeText={handleCepChange}
                  error={cepError}
                  rightElement={cepLoading ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
                />
              </View>
              <SelectField
                label="Estado"
                placeholder="UF"
                value={estado || undefined}
                onPress={() => {}}
                style={styles.estadoField}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Rua"
                icon="location-outline"
                placeholder="Nome da rua"
                value={rua}
                onChangeText={setRua}
              />
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Input
                label="Número"
                placeholder="123"
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
                containerStyle={styles.numeroContainer}
              />
              <View style={styles.rowFlex}>
                <Input
                  label="Complemento"
                  placeholder="Apto, sala..."
                  value={complemento}
                  onChangeText={setComplemento}
                />
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={bairro}
                onChangeText={setBairro}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <SelectField
                label="Cidade"
                placeholder="Selecione a cidade"
                value={cidade || undefined}
                onPress={() => {}}
              />
            </View>
          </>
        )}

        {tabPrincipal === "empresas" && (
          <>
            <Text style={styles.sectionLabel}>DADOS DA EMPRESA</Text>

            <View style={styles.fieldSpacing}>
              <Input
                label="CNPJ"
                icon="document-text-outline"
                placeholder="00.000.000/0001-00"
                keyboardType="numeric"
                value={cnpjEmpresa}
                onChangeText={setCnpjEmpresa}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Razão Social"
                placeholder="Nome da empresa"
                value={razaoSocial}
                onChangeText={setRazaoSocial}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <SelectField
                label="Ramo do estabelecimento"
                placeholder="Selecione o ramo"
                value={ramoEstabelecimento || undefined}
                onPress={() => {}}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Nome do estabelecimento"
                icon="storefront-outline"
                placeholder="Nome fantasia"
                value={nomeEstabelecimento}
                onChangeText={setNomeEstabelecimento}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Celular"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={celularEmpresa}
                onChangeText={setCelularEmpresa}
              />
            </View>

            <Text style={styles.sectionLabel}>Fotos do estabelecimento</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <PhotoUpload uri={foto1 || undefined} onChange={setFoto1} />
              <PhotoUpload uri={foto2 || undefined} onChange={setFoto2} />
            </View>

            <Text style={styles.sectionLabel}>ENDEREÇO</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={styles.rowFlex}>
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  value={cep}
                  onChangeText={handleCepChange}
                  error={cepError}
                  rightElement={cepLoading ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
                />
              </View>
              <SelectField
                label="Estado"
                placeholder="UF"
                value={estado || undefined}
                onPress={() => {}}
                style={styles.estadoField}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Rua"
                icon="location-outline"
                placeholder="Nome da rua"
                value={rua}
                onChangeText={setRua}
              />
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Input
                label="Número"
                placeholder="123"
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
                containerStyle={styles.numeroContainer}
              />
              <View style={styles.rowFlex}>
                <Input
                  label="Complemento"
                  placeholder="Apto, sala..."
                  value={complemento}
                  onChangeText={setComplemento}
                />
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={bairro}
                onChangeText={setBairro}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <SelectField
                label="Cidade"
                placeholder="Selecione a cidade"
                value={cidade || undefined}
                onPress={() => {}}
              />
            </View>

            <Text style={styles.sectionLabel}>RESPONSÁVEL PELA OPERAÇÃO</Text>

            <View style={styles.fieldSpacing}>
              <Input
                label="Nome e sobrenome"
                icon="person-outline"
                placeholder="Nome do responsável"
                value={nomeResponsavel}
                onChangeText={setNomeResponsavel}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Telefone do responsável"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={telefoneResponsavel}
                onChangeText={setTelefoneResponsavel}
              />
            </View>
          </>
        )}

        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Finalizar cadastro" onPress={handleSubmit} />
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
