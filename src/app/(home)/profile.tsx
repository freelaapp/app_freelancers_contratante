import { AvatarInitials } from "@/components/avatar-initials";
import { CardHeader } from "@/components/card-header";
import { Divider } from "@/components/divider";
import { cardShadow, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { contractorService } from "@/services/contractor.service";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showDivider?: boolean;
};

function MenuItem({ icon, title, subtitle, onPress, showDivider = true }: MenuItemProps) {
  return (
    <>
      {showDivider && <Divider />}
      <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name={icon} size={22} color={colors.ink} style={styles.menuIcon} />
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </TouchableOpacity>
    </>
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
    <TouchableOpacity style={styles.photoSlot} onPress={onPress} activeOpacity={0.7} disabled={uploading}>
      {uploading ? (
        <ActivityIndicator color={colors.primary} />
      ) : uri ? (
        <Image
          source={{ uri }}
          style={{ flex: 1, alignSelf: "stretch" }}
          resizeMode="cover"
          onLoad={() => console.log(`[PROFILE] imagem carregou: ${uri}`)}
          onError={(e) => console.warn(`[PROFILE] erro ao carregar imagem: ${uri}`, e.nativeEvent)}
        />
      ) : (
        <>
          <Ionicons name="image-outline" size={28} color={colors.primary} />
          <Text style={styles.photoLabel}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [facadeUri, setFacadeUri] = useState<string | null>(null);
  const [interiorUri, setInteriorUri] = useState<string | null>(null);
  const [uploadingFacade, setUploadingFacade] = useState(false);
  const [uploadingInterior, setUploadingInterior] = useState(false);

  const isBars = user?.module === "bars-restaurants";

  useEffect(() => {
    console.log("[PROFILE] user contexto:", JSON.stringify({ module: user?.module, contractorId: user?.contractorId }, null, 2));
    if (!isBars || !user?.contractorId) return;
    contractorService.getBarsById(user.contractorId).then((res) => {
      const data = (res.data as any).props ?? res.data;
      console.log("[PROFILE] dados contractor banco:", JSON.stringify(data, null, 2));
      setFacadeUri(data.establishmentFacadeImage ?? null);
      setInteriorUri(data.establishmentInteriorImage ?? null);
    }).catch((err) => console.warn("[PROFILE] erro getBarsById:", err));
  }, [user?.contractorId, isBars]);

  async function pickAndUpload(type: "facade" | "interior") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria nas configurações.");
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

      const res = await contractorService.updateBarsImages(payload);
      const data = (res.data as any).props ?? res.data;
      console.log(`[PROFILE] upload ${type} resposta banco:`, JSON.stringify(data, null, 2));
      setUri(uri);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "C";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing["12"] }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <AvatarInitials initials={initials} size={56} />
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{user?.name ?? "Contratante"}</Text>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.primary} />
            <Text style={styles.ratingText}>0</Text>
          </View>
        </View>
      </View>

      {isBars && (
        <View style={[styles.card, styles.photosCard]}>
          <CardHeader icon="image-outline" title="Fotos do Estabelecimento" iconColor={colors.ink} />
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
        </View>
      )}

      <View style={[styles.card, styles.menuCard]}>
        <MenuItem
          icon="receipt-outline"
          title="Meus Dados"
          subtitle="Dados do estabelecimento"
          showDivider={false}
        />
        <MenuItem
          icon="card-outline"
          title="Financeiro"
          subtitle="Gastos e histórico de pagamentos"
        />
        <MenuItem
          icon="settings-outline"
          title="Configurações"
          subtitle="Privacidade, notificações e conta"
        />
        <MenuItem
          icon="help-circle-outline"
          title="Ajuda"
          subtitle="Dúvidas e suporte"
        />
      </View>

      <View style={[styles.card, styles.logoutCard]}>
        <TouchableOpacity style={styles.logoutRow} onPress={signOut} activeOpacity={0.7}>
          <Ionicons name="exit-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["16"],
    gap: spacing["8"],
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["8"],
    paddingHorizontal: spacing["2"],
    marginBottom: spacing["4"],
  },
  profileInfo: {
    gap: spacing["2"],
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  ratingText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    ...cardShadow,
  },
  photosCard: {
    padding: spacing["8"],
    gap: spacing["8"],
  },
  photosRow: {
    flexDirection: "row",
    gap: spacing["8"],
  },
  photoSlot: {
    flex: 1,
    height: 110,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: radii.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing["3"],
    backgroundColor: "rgba(245, 166, 35, 0.05)",
    overflow: "hidden",
  },
  photoLabel: {
    fontSize: fontSizes.base,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  menuCard: {
    paddingHorizontal: spacing["8"],
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["10"],
    gap: spacing["6"],
  },
  menuIcon: {
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    gap: spacing["1"],
  },
  menuTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  menuSubtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  logoutCard: {
    paddingHorizontal: spacing["8"],
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["6"],
    paddingVertical: spacing["10"],
  },
  logoutText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },
});
