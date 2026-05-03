import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";
import { MaskedInput } from "@/components/masked-input";

const CPF_MASK = [
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
];

const CNPJ_MASK = [
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  ".",
  /\d/,
  /\d/,
  /\d/,
  "/",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
];

const PHONE_MASK = [
  "(",
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

const CEP_MASK = [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];

const DATE_MASK = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
import { PhotoUpload } from "@/components/photo-upload";
import { PrimaryButton } from "@/components/primary-button";
import { SelectField } from "@/components/select-field";
import { TabSelector } from "@/components/tab-selector";
import { useAuth } from "@/context/auth-context";
import { contractorService } from "@/services/contractor.service";
import { toast } from "@/utils/toast";
import { CepNotFoundError, fetchAddressByCep, fetchCoordinatesByCep } from "@/services/viacep";
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
  const { completeProfile, user } = useAuth();
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
  const [emailResponsavel, setEmailResponsavel] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
  const [foto1, setFoto1] = useState("");
  const [foto2, setFoto2] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  // Address states for empresas tab (separate from casa)
  const [cepEmpresa, setCepEmpresa] = useState("");
  const [estadoEmpresa, setEstadoEmpresa] = useState("");
  const [ruaEmpresa, setRuaEmpresa] = useState("");
  const [numeroEmpresa, setNumeroEmpresa] = useState("");
  const [complementoEmpresa, setComplementoEmpresa] = useState("");
  const [bairroEmpresa, setBairroEmpresa] = useState("");
  const [cidadeEmpresa, setCidadeEmpresa] = useState("");
  const [latitudeEmpresa, setLatitudeEmpresa] = useState<number | undefined>(undefined);
  const [longitudeEmpresa, setLongitudeEmpresa] = useState<number | undefined>(undefined);
  const [cepEmpresaLoading, setCepEmpresaLoading] = useState(false);
  const [cepEmpresaError, setCepEmpresaError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchCep(raw: string) {
    setCepLoading(true);
    setCepError("");
    setLatitude(undefined);
    setLongitude(undefined);
    try {
      const [address, coords] = await Promise.all([
        fetchAddressByCep(raw),
        fetchCoordinatesByCep(raw),
      ]);
      setRua(address.logradouro ?? "");
      setBairro(address.bairro ?? "");
      setCidade(address.localidade ?? "");
      setEstado(address.uf ?? "");
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
      }
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

  async function fetchCepEmpresa(raw: string) {
    setCepEmpresaLoading(true);
    setCepEmpresaError("");
    setLatitudeEmpresa(undefined);
    setLongitudeEmpresa(undefined);
    try {
      const [address, coords] = await Promise.all([
        fetchAddressByCep(raw),
        fetchCoordinatesByCep(raw),
      ]);
      setRuaEmpresa(address.logradouro ?? "");
      setBairroEmpresa(address.bairro ?? "");
      setCidadeEmpresa(address.localidade ?? "");
      setEstadoEmpresa(address.uf ?? "");
      if (coords) {
        setLatitudeEmpresa(coords.latitude);
        setLongitudeEmpresa(coords.longitude);
      }
    } catch (err) {
      setCepEmpresaError(err instanceof CepNotFoundError ? "CEP não encontrado" : "Erro ao buscar CEP");
    } finally {
      setCepEmpresaLoading(false);
    }
  }

  function handleCepEmpresaChange(value: string) {
    setCepEmpresa(value);
    setCepEmpresaError("");
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) fetchCepEmpresa(value);
  }

  async function handleSubmitForm() {
    setIsSubmitting(true);
    try {
      const addressParts = [rua, numero, complemento, bairro, cidade, estado]
        .filter(Boolean)
        .join(", ");

      if (tabPrincipal === "casa") {
        const casaPayload = {
          document: documento ? documento.replace(/\D/g, "") : undefined,
          cep: cep ? cep.replace(/\D/g, "") : undefined,
          street: rua || undefined,
          neighborhood: bairro || undefined,
          city: cidade || undefined,
          uf: estado || undefined,
          number: numero || undefined,
          complement: complemento || undefined,
          address: addressParts || undefined,
          latitude,
          longitude,
        };
        console.log("[ONBOARDING] payload home-services:", JSON.stringify(casaPayload, null, 2));
        const casaRes = await contractorService.createCasa(casaPayload);
        console.log("[ONBOARDING] resposta home-services:", JSON.stringify(casaRes.data, null, 2));
        completeProfile("home-services", casaRes.data.id);
        toast.success("Freela em Casa cadastrado com sucesso!", `Bem-vindo, ${user?.name ?? ""}!`);
      } else {
        const barsPayload = {
          contactName: nomeResponsavel || undefined,
          contactEmail: emailResponsavel || undefined,
          contactPhone: telefoneResponsavel ? telefoneResponsavel.replace(/\D/g, "") : undefined,
          cep: cepEmpresa ? cepEmpresa.replace(/\D/g, "") : undefined,
          street: ruaEmpresa || undefined,
          neighborhood: bairroEmpresa || undefined,
          city: cidadeEmpresa || undefined,
          uf: estadoEmpresa || undefined,
          number: numeroEmpresa || undefined,
          complement: complementoEmpresa || undefined,
          latitude: latitudeEmpresa,
          longitude: longitudeEmpresa,
          cnpj: cnpjEmpresa ? cnpjEmpresa.replace(/\D/g, "") : undefined,
          corporateReason: razaoSocial || undefined,
          companyName: nomeEstabelecimento || undefined,
          segment: ramoEstabelecimento || undefined,
        };
        console.log("[ONBOARDING] payload bars-restaurants:", JSON.stringify(barsPayload, null, 2));
        const barsRes = await contractorService.createBars(barsPayload);
        console.log("[ONBOARDING] resposta bars-restaurants:", JSON.stringify(barsRes.data, null, 2));

        if (foto1 || foto2) {
          const imgRes = await contractorService.updateBarsImages({
            establishmentFacadeImage: foto1 || undefined,
            establishmentInteriorImage: foto2 || undefined,
          });
          console.log("[ONBOARDING] upload imagens bars-restaurants:", JSON.stringify(imgRes.data, null, 2));
        }

        completeProfile("bars-restaurants", barsRes.data.id);
        toast.success("Freela para Empresas cadastrado com sucesso!", `Bem-vindo, ${user?.name ?? ""}!`);
      }
      router.replace("/(home)");
    } catch {
      toast.error("Não foi possível concluir o cadastro.", "Verifique os dados e tente novamente.")
    } finally {
      setIsSubmitting(false);
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
              <MaskedInput
                label="Número do documento"
                icon="document-text-outline"
                placeholder={tabDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0001-00"}
                keyboardType="numeric"
                value={documento}
                onChangeText={setDocumento}
                mask={tabDocumento === "cpf" ? CPF_MASK : CNPJ_MASK}
                maxLength={tabDocumento === "cpf" ? 14 : 18}
                hint={tabDocumento === "cpf" ? "CPF" : "CNPJ"}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <MaskedInput
                label="Celular"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={celular}
                onChangeText={setCelular}
                mask={PHONE_MASK}
                maxLength={15}
                hint="DDD + número"
              />
            </View>

            <View style={styles.fieldSpacing}>
              <MaskedInput
                label="Data de nascimento"
                icon="calendar-outline"
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={dataNascimento}
                onChangeText={setDataNascimento}
                mask={DATE_MASK}
                maxLength={10}
                hint="DD/MM/AAAA"
              />
            </View>

            <Text style={styles.sectionLabel}>ENDEREÇO</Text>

            <View style={[styles.row, styles.fieldSpacing]}>
              <View style={styles.rowFlex}>
                <MaskedInput
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  value={cep}
                  onChangeText={handleCepChange}
                  error={cepError}
                  mask={CEP_MASK}
                  maxLength={9}
                  hint="CEP"
                  rightElement={
                    cepLoading
                      ? <ActivityIndicator size="small" color={colors.primary} />
                      : undefined
                  }
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
                maxLength={6}
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
              <Input
                label="Cidade"
                icon="location-outline"
                placeholder="Cidade"
                value={cidade}
                onChangeText={setCidade}
              />
            </View>
          </>
        )}

        {tabPrincipal === "empresas" && (
          <>
            <Text style={styles.sectionLabel}>DADOS DA EMPRESA</Text>

            <View style={styles.fieldSpacing}>
              <MaskedInput
                label="CNPJ"
                icon="document-text-outline"
                placeholder="00.000.000/0001-00"
                keyboardType="numeric"
                value={cnpjEmpresa}
                onChangeText={setCnpjEmpresa}
                mask={CNPJ_MASK}
                maxLength={18}
                hint="CNPJ"
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
              <Input
                label="Ramo do estabelecimento"
                icon="storefront-outline"
                placeholder="Ex: Restaurante, Bar, Café..."
                value={ramoEstabelecimento}
                onChangeText={setRamoEstabelecimento}
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
              <MaskedInput
                label="Celular"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={celularEmpresa}
                onChangeText={setCelularEmpresa}
                mask={PHONE_MASK}
                maxLength={15}
                hint="DDD + número"
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
                <MaskedInput
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  value={cepEmpresa}
                  onChangeText={handleCepEmpresaChange}
                  error={cepEmpresaError}
                  mask={CEP_MASK}
                  maxLength={9}
                  hint="CEP"
                  rightElement={cepEmpresaLoading ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
                />
              </View>
              <SelectField
                label="Estado"
                placeholder="UF"
                value={estadoEmpresa || undefined}
                onPress={() => {}}
                style={styles.estadoField}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Rua"
                icon="location-outline"
                placeholder="Nome da rua"
                value={ruaEmpresa}
                onChangeText={setRuaEmpresa}
              />
            </View>

            <View style={[styles.row, styles.fieldSpacing]}>
              <Input
                label="Número"
                placeholder="123"
                keyboardType="numeric"
                value={numeroEmpresa}
                onChangeText={setNumeroEmpresa}
                containerStyle={styles.numeroContainer}
                maxLength={6}
              />
              <View style={styles.rowFlex}>
                <Input
                  label="Complemento"
                  placeholder="Apto, sala..."
                  value={complementoEmpresa}
                  onChangeText={setComplementoEmpresa}
                />
              </View>
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={bairroEmpresa}
                onChangeText={setBairroEmpresa}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Input
                label="Cidade"
                icon="location-outline"
                placeholder="Cidade"
                value={cidadeEmpresa}
                onChangeText={setCidadeEmpresa}
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
                label="E-mail do responsável"
                icon="mail-outline"
                placeholder="email@empresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailResponsavel}
                onChangeText={setEmailResponsavel}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <MaskedInput
                label="Telefone do responsável"
                icon="call-outline"
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={telefoneResponsavel}
                onChangeText={setTelefoneResponsavel}
                mask={PHONE_MASK}
                maxLength={15}
                hint="DDD + número"
              />
            </View>
          </>
        )}

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label={isSubmitting ? "Enviando..." : "Finalizar cadastro"}
            onPress={handleSubmitForm}
            disabled={isSubmitting}
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
    alignItems: "flex-start",
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
