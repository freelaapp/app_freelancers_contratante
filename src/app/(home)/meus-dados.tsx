import { Input } from "@/components/input";
import { MaskedInput } from "@/components/masked-input";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/services/auth.service";
import { contractorService } from "@/services/contractor.service";
import { CepNotFoundError, fetchAddressByCep } from "@/services/viacep";
import { goBackOrReplace } from "@/utils/navigation";
import { toast } from "@/utils/toast";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as yup from "yup";

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

type UserFormValues = {
  name: string;
};

type EstablishmentFormValues = {
  companyName: string;
  corporateReason: string;
  segment: string;
};

type AddressFormValues = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
};

const userSchema = yup.object({
  name: yup
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .required("Nome é obrigatório"),
});

const establishmentSchema = yup.object({
  companyName: yup.string().default(""),
  corporateReason: yup.string().default(""),
  segment: yup.string().default(""),
});

const addressSchema = yup.object({
  cep: yup.string().default(""),
  street: yup.string().default(""),
  number: yup.string().default(""),
  complement: yup.string().default(""),
  neighborhood: yup.string().default(""),
  city: yup.string().default(""),
  uf: yup.string().max(2, "UF deve ter 2 caracteres").default(""),
});

type SectionCardProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
};

type InlineHeaderProps = { top: number; onBack: () => void; title: string };

function InlineHeader({ top, onBack, title }: InlineHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: top + 8 }]}>
      <TouchableOpacity testID="back-button" onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

function SectionCard({ iconName, title, children, danger = false }: SectionCardProps) {
  return (
    <View style={[styles.card, danger && styles.dangerCard]}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={iconName}
          size={20}
          color={danger ? colors.error : colors.primary}
        />
        <Text style={[styles.sectionTitle, danger && styles.dangerTitle]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

type ReadOnlyFieldProps = {
  label: string;
  value: string;
  helperText?: string;
  mask?: (string | RegExp)[];
};

function ReadOnlyField({ label, value, helperText }: ReadOnlyFieldProps) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.readOnlyInput}>
        <Text style={styles.readOnlyText}>{value || "—"}</Text>
        <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
      </View>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

type PhotoSlotProps = {
  uri: string | null;
  label: string;
  uploading: boolean;
  onPress: () => void;
};

function PhotoSlot({ uri, label, uploading, onPress }: PhotoSlotProps) {
  return (
    <TouchableOpacity
      style={styles.photoSlot}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : uri ? (
        <Image
          source={{ uri }}
          style={styles.photoImage}
          resizeMode="cover"
        />
      ) : (
        <>
          <Ionicons name="image-outline" size={24} color={colors.primary} />
          <Text style={styles.photoLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type SaveButtonProps = {
  label: string;
  onPress: () => void;
  loading: boolean;
};

function SaveButton({ label, onPress, loading }: SaveButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.saveButton, loading && styles.saveButtonDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.saveButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

type Tab = { key: string; label: string };
type TabMenuProps = { tabs: Tab[]; active: string; onChange: (key: string) => void };

function TabMenu({ tabs, active, onChange }: TabMenuProps) {
  return (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function MeusDadosScreen() {
  const { user } = useAuth();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();

  const isBars = user?.module === "bars-restaurants";
  const isCasa = user?.module === "home-services";

  const tabs: Tab[] = isBars
    ? [
        { key: "dados", label: "Meus Dados" },
        { key: "estabelecimento", label: "Estabelecimento" },
        { key: "endereco", label: "Endereço" },
        { key: "conta", label: "Conta" },
      ]
    : isCasa
    ? [
        { key: "dados", label: "Meus Dados" },
        { key: "endereco", label: "Endereço" },
        { key: "conta", label: "Conta" },
      ]
    : [
        { key: "dados", label: "Meus Dados" },
        { key: "conta", label: "Conta" },
      ];

  const [activeTab, setActiveTab] = useState("dados");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [document, setDocument] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [facadeUri, setFacadeUri] = useState<string | null>(null);
  const [interiorUri, setInteriorUri] = useState<string | null>(null);
  const [uploadingFacade, setUploadingFacade] = useState(false);
  const [uploadingInterior, setUploadingInterior] = useState(false);

  const [savingUser, setSavingUser] = useState(false);
  const [savingEstablishment, setSavingEstablishment] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  const userForm = useForm<UserFormValues>({
    resolver: yupResolver(userSchema),
    defaultValues: { name: "" },
  });

  const establishmentForm = useForm<EstablishmentFormValues>({
    resolver: yupResolver(establishmentSchema),
    defaultValues: { companyName: "", corporateReason: "", segment: "" },
  });

  const addressForm = useForm<AddressFormValues>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      uf: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const profileRes = await authService.getProfile();
        const profile = profileRes.data;

        userForm.reset({ name: profile.name ?? user?.name ?? "" });
        setEmail(user?.email ?? "");
        setPhone(profile.phone ?? "");

        if (isBars && user?.contractorId) {
          const barsRes = await contractorService.getBarsById(user.contractorId);
          const barsData =
            (barsRes.data as unknown as { props?: typeof barsRes.data }).props ??
            barsRes.data;

          establishmentForm.reset({
            companyName: barsData.companyName ?? "",
            corporateReason: barsData.corporateReason ?? "",
            segment: barsData.segment ?? "",
          });

          setDocument(barsData.cnpj ?? barsData.document ?? "");
          setFacadeUri(barsData.establishmentFacadeImage ?? null);
          setInteriorUri(barsData.establishmentInteriorImage ?? null);
          setContactName(barsData.contactName ?? "");
          setContactPhone(barsData.contactPhone ?? "");

          addressForm.reset({
            cep: barsData.cep ?? "",
            street: barsData.street ?? "",
            number: barsData.number ?? "",
            complement: barsData.complement ?? "",
            neighborhood: barsData.neighborhood ?? "",
            city: barsData.city ?? "",
            uf: barsData.uf ?? "",
          });
        }

        if (isCasa && user?.contractorId) {
          const casaRes = await contractorService.getCasaById(user.contractorId);
          const casaData =
            (casaRes.data as unknown as { props?: typeof casaRes.data }).props ??
            casaRes.data;

          setDocument(casaData.document ?? "");
        }
      } catch {
        toast.error("Não foi possível carregar seus dados.", "Tente novamente.");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user?.contractorId, isBars, isCasa]);

  async function handleCepChange(raw: string) {
    addressForm.setValue("cep", raw);
    setCepError("");
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const address = await fetchAddressByCep(raw);
      addressForm.setValue("street", address.logradouro ?? "");
      addressForm.setValue("neighborhood", address.bairro ?? "");
      addressForm.setValue("city", address.localidade ?? "");
      addressForm.setValue("uf", address.uf ?? "");
    } catch (err) {
      setCepError(
        err instanceof CepNotFoundError ? "CEP não encontrado" : "Erro ao buscar CEP"
      );
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSaveUser(values: UserFormValues) {
    setSavingUser(true);
    try {
      await authService.updateProfile({ name: values.name });
      toast.success("Informações salvas com sucesso!");
    } catch {
      toast.error("Não foi possível salvar.", "Tente novamente.");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleSaveEstablishment(values: EstablishmentFormValues) {
    setSavingEstablishment(true);
    try {
      await contractorService.updateBars({
        companyName: values.companyName || undefined,
        segment: values.segment || undefined,
      });
      toast.success("Estabelecimento atualizado!");
    } catch {
      toast.error("Não foi possível salvar.", "Tente novamente.");
    } finally {
      setSavingEstablishment(false);
    }
  }

  async function handleSaveAddress(values: AddressFormValues) {
    setSavingAddress(true);
    try {
      const addressParts = [
        values.street,
        values.number,
        values.complement,
        values.neighborhood,
        values.city,
        values.uf,
      ]
        .filter(Boolean)
        .join(", ");

      await contractorService.updateCasa({
        cep: values.cep ? values.cep.replace(/\D/g, "") : undefined,
        street: values.street || undefined,
        neighborhood: values.neighborhood || undefined,
        city: values.city || undefined,
        uf: values.uf || undefined,
        number: values.number || undefined,
        complement: values.complement || undefined,
        address: addressParts || undefined,
      });
      toast.success("Endereço atualizado!");
    } catch {
      toast.error("Não foi possível salvar.", "Tente novamente.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function pickAndUpload(type: "facade" | "interior") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria nas configurações."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    const setUploading = type === "facade" ? setUploadingFacade : setUploadingInterior;
    const setUri = type === "facade" ? setFacadeUri : setInteriorUri;

    setUploading(true);
    try {
      const payload =
        type === "facade"
          ? { establishmentFacadeImage: uri }
          : { establishmentInteriorImage: uri };
      await contractorService.updateBarsImages(payload);
      setUri(uri);
      toast.success("Imagem atualizada com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  function handleRequestDeletion() {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar" },
        {
          text: "Solicitar",
          style: "destructive",
          onPress: () => toast.info("Funcionalidade em breve."),
        },
      ]
    );
  }

  if (isLoadingData) {
    return (
      <View style={styles.root}>
        <InlineHeader top={top} onBack={() => goBackOrReplace(router, "/(home)")} title={isBars ? "Perfil do Estabelecimento" : "Meus Dados"} />
        <TabMenu tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} testID="loading-indicator" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior="padding"
    >
      <InlineHeader top={top} onBack={() => goBackOrReplace(router, "/(home)")} title={isBars ? "Perfil do Estabelecimento" : "Meus Dados"} />
      <TabMenu tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottom, spacing["10"]) + spacing["8"] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isBars && activeTab === "estabelecimento" && (
          <SectionCard iconName="image-outline" title="Fotos do Estabelecimento">
            <View style={styles.photosRow}>
              <PhotoSlot
                uri={facadeUri}
                label="Fachada"
                uploading={uploadingFacade}
                onPress={() => pickAndUpload("facade")}
              />
              <PhotoSlot
                uri={interiorUri}
                label="Ambiente Interno"
                uploading={uploadingInterior}
                onPress={() => pickAndUpload("interior")}
              />
            </View>
          </SectionCard>
        )}

        {activeTab === "dados" && <SectionCard iconName="person-outline" title="Informações do Usuário">
          <Controller
            control={userForm.control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Nome"
                placeholder="Seu nome completo"
                value={value}
                onChangeText={onChange}
                error={userForm.formState.errors.name?.message}
                autoCapitalize="words"
              />
            )}
          />

          <View style={styles.fieldGap}>
            <ReadOnlyField label="E-mail" value={email} />
          </View>

          <View style={styles.fieldGap}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Celular</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{phone || "—"}</Text>
                <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
              </View>
            </View>
          </View>

          <View style={styles.buttonGap}>
            <SaveButton
              label="Salvar Informações"
              onPress={userForm.handleSubmit(handleSaveUser)}
              loading={savingUser}
            />
          </View>
        </SectionCard>}

        {isBars && activeTab === "estabelecimento" && (
          <SectionCard iconName="storefront-outline" title="Dados do Estabelecimento">
            <Controller
              control={establishmentForm.control}
              name="companyName"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Nome do Estabelecimento"
                  placeholder="Nome fantasia"
                  value={value}
                  onChangeText={onChange}
                  error={establishmentForm.formState.errors.companyName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <View style={styles.fieldGap}>
              <Controller
                control={establishmentForm.control}
                name="corporateReason"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Razão Social"
                    placeholder="Razão social da empresa"
                    value={value}
                    onChangeText={onChange}
                    error={establishmentForm.formState.errors.corporateReason?.message}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>

            <View style={styles.fieldGap}>
              <ReadOnlyField
                label="CNPJ"
                value={document || "—"}
                helperText="O CNPJ não pode ser alterado."
              />
            </View>

            <View style={styles.fieldGap}>
              <Controller
                control={establishmentForm.control}
                name="segment"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Ramo de Atividade"
                    placeholder="Ex: Restaurante, Bar, Buffet..."
                    value={value}
                    onChangeText={onChange}
                    error={establishmentForm.formState.errors.segment?.message}
                    autoCapitalize="sentences"
                  />
                )}
              />
            </View>

            <View style={styles.buttonGap}>
              <SaveButton
                label="Salvar Alterações"
                onPress={establishmentForm.handleSubmit(handleSaveEstablishment)}
                loading={savingEstablishment}
              />
            </View>
          </SectionCard>
        )}

        {activeTab === "endereco" && (
          <SectionCard iconName="location-outline" title="Endereço">
            <Controller
              control={addressForm.control}
              name="cep"
              render={({ field: { value } }) => (
                <MaskedInput
                  label="CEP"
                  placeholder="00000-000"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={handleCepChange}
                  mask={CEP_MASK}
                  maxLength={9}
                  error={cepError || undefined}
                  rightElement={
                    cepLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : undefined
                  }
                />
              )}
            />

            <View style={styles.fieldGap}>
              <Controller
                control={addressForm.control}
                name="street"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Rua"
                    placeholder="Nome da rua"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGap, styles.row]}>
              <View style={styles.flexOne}>
                <Controller
                  control={addressForm.control}
                  name="number"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Número"
                      placeholder="123"
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                      maxLength={6}
                    />
                  )}
                />
              </View>
              <View style={styles.flexOneHalf}>
                <Controller
                  control={addressForm.control}
                  name="complement"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Complemento"
                      placeholder="Apto, sala..."
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.fieldGap}>
              <Controller
                control={addressForm.control}
                name="neighborhood"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label="Bairro"
                    placeholder="Bairro"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            <View style={[styles.fieldGap, styles.row]}>
              <View style={styles.flexOneHalf}>
                <Controller
                  control={addressForm.control}
                  name="city"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Cidade"
                      placeholder="Selecione a cidade"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              <View style={styles.flexOne}>
                <Controller
                  control={addressForm.control}
                  name="uf"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Estado"
                      placeholder="UF"
                      value={value}
                      onChangeText={onChange}
                      maxLength={2}
                      autoCapitalize="characters"
                      error={addressForm.formState.errors.uf?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.buttonGap}>
              <SaveButton
                label="Salvar Endereço"
                onPress={addressForm.handleSubmit(handleSaveAddress)}
                loading={savingAddress}
              />
            </View>
          </SectionCard>
        )}

        {isBars && activeTab === "estabelecimento" && (
          <SectionCard iconName="person-circle-outline" title="Responsável pela Operação">
            <ReadOnlyField
              label="Nome do Responsável"
              value={contactName || "—"}
              helperText="Não pode ser alterado após o cadastro."
            />

            <View style={styles.fieldGap}>
              <ReadOnlyField
                label="Telefone"
                value={contactPhone || "—"}
                helperText="Não pode ser alterado após o cadastro."
              />
            </View>
          </SectionCard>
        )}

        {activeTab === "conta" && (
          <SectionCard iconName="shield-checkmark-outline" title="Dados de Acesso">
            <ReadOnlyField
              label="E-mail"
              value={email}
              helperText="Para alterar o e-mail, entre em contato com o suporte."
            />
            <View style={styles.fieldGap}>
              <ReadOnlyField
                label="Telefone"
                value={phone || "—"}
                helperText="Para alterar o telefone, entre em contato com o suporte."
              />
            </View>
          </SectionCard>
        )}

        {activeTab === "conta" && <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={20} color={colors.error} />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>
              Zona de Perigo
            </Text>
          </View>

          <Text style={styles.dangerDescription}>
            Ao solicitar a exclusão, um código será enviado para seu e-mail. Após
            confirmação, sua conta será apagada em 7 dias. Faça login novamente para
            cancelar.
          </Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleRequestDeletion}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.dangerButtonText}>
              Solicitar Exclusão da Conta
            </Text>
          </TouchableOpacity>
        </View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["8"],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabBarContent: {
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["4"],
    gap: spacing["3"],
  },
  tabItem: {
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    gap: spacing["8"],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing["8"],
    ...cardShadowStrong,
  },
  dangerCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    marginBottom: spacing["8"],
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  dangerTitle: {
    color: colors.error,
  },
  fieldWrapper: {
    gap: spacing["3"],
  },
  fieldLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  readOnlyInput: {
    height: 52,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing["7"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readOnlyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    marginTop: spacing["2"],
  },
  fieldGap: {
    marginTop: spacing["8"],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing["6"],
  },
  flexOne: {
    flex: 1,
  },
  flexOneHalf: {
    flex: 1.5,
  },
  buttonGap: {
    marginTop: spacing["8"],
  },
  saveButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  photosRow: {
    flexDirection: "row",
    gap: spacing["8"],
  },
  photoSlot: {
    flex: 1,
    height: 90,
    backgroundColor: "#FFFBF2",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["3"],
    overflow: "hidden",
  },
  photoImage: {
    flex: 1,
    alignSelf: "stretch",
  },
  photoLabel: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  dangerDescription: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing["8"],
  },
  dangerButton: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["4"],
  },
  dangerButtonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.error,
  },
});
