import { AvatarInitials } from "@/components/avatar-initials";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { CenteredModal } from "@/components/centered-modal";
import { Divider } from "@/components/divider";
import { FreelancerProfileSheet } from "@/components/freelancer-profile-sheet";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { type Candidato, type VagaDetalhe } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  "Criar Vaga",
  "Aceite da vaga",
  "Pagamento",
  "Início do Trabalho",
  "Término do Trabalho",
  "Repasse ao freelancer",
  "Feedback",
];

type CodeModalProps = {
  visible: boolean;
  code: string | null;
  title: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

function CodeModal({ visible, code, title, confirmLabel, onClose, onConfirm }: CodeModalProps) {
  return (
    <CenteredModal visible={visible} onClose={onClose} contentStyle={styles.checkinModal}>
      <TouchableOpacity style={styles.checkinClose} onPress={onClose} hitSlop={8}>
        <Ionicons name="close" size={22} color={colors.ink} />
      </TouchableOpacity>
      <Text style={styles.checkinModalText}>
        {title === "Código de Check-in"
          ? "Mande o código de check-in para o freelancer"
          : "Mande o código de check-out para o freelancer"}
      </Text>
      <View style={styles.checkinCodeBox}>
        <Text style={styles.checkinCode}>
          {code?.split("").join("  ")}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.checkinConfirmBtn}
        activeOpacity={0.85}
        onPress={onConfirm}
      >
        <Text style={styles.checkinConfirmBtnText}>{confirmLabel}</Text>
      </TouchableOpacity>
    </CenteredModal>
  );
}

function InfoCard({ vaga }: { vaga: VagaDetalhe }) {
  return (
    <View style={styles.card}>
      <View style={styles.infoTopRow}>
        <View style={styles.infoCol}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Data e Horário</Text>
            <Text style={styles.infoValueBold}>{vaga.data}</Text>
            <Text style={styles.infoValueMuted}>{vaga.horario}</Text>
          </View>
        </View>
        <Divider orientation="vertical" />
        <View style={styles.infoCol}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Local</Text>
            <Text style={styles.infoValueBold}>{vaga.local}</Text>
            <Text style={styles.infoValueMuted}>{vaga.distancia}</Text>
          </View>
        </View>
      </View>

      <Divider />

      <View style={styles.infoBottomRow}>
        <View style={styles.infoBottomLeft}>
          <Ionicons name="hourglass-outline" size={15} color={colors.muted} />
          <Text style={styles.infoDuracao}>Duração: {vaga.duracao}</Text>
        </View>
        <Text style={styles.infoValor}>{vaga.valor}</Text>
      </View>
    </View>
  );
}

function CandidatoRow({ item, showDivider, onVerPerfil, onAceitar, onRecusar }: {
  item: Candidato;
  showDivider: boolean;
  onVerPerfil: () => void;
  onAceitar?: () => void;
  onRecusar?: () => void;
}) {
  const isAceito = item.status === "aceito";
  const isRecusado = item.status === "recusado";

  return (
    <>
      {showDivider && <Divider />}
      <View style={styles.candidatoRow}>
        <AvatarInitials initials={item.iniciais} size={40} backgroundColor={colors.primary} />
        <View style={styles.candidatoInfo}>
          <Text style={styles.candidatoNome}>{item.nome}</Text>
          <Text style={styles.candidatoCargo}>{item.cargo}</Text>
          <View style={styles.candidatoMeta}>
            <Ionicons name="star" size={11} color={colors.primary} />
            <Text style={styles.candidatoMetaText}>
              {item.avaliacao} ({item.reviews}) • {item.jobs} jobs
            </Text>
          </View>
        </View>
        <View style={styles.candidatoActions}>
          {isAceito && (
            <StatusBadge status="aceito" label="Aceito" />
          )}
          {isRecusado && (
            <StatusBadge status="recusado" label="Recusado" />
          )}
          {!isAceito && !isRecusado && (
            <>
              <TouchableOpacity style={styles.actionBtnGreen} activeOpacity={0.7} onPress={onAceitar}>
                <Ionicons name="person-add-outline" size={16} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnRed} activeOpacity={0.7} onPress={onRecusar}>
                <Ionicons name="person-remove-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.actionBtnGray} activeOpacity={0.7} onPress={onVerPerfil}>
            <Ionicons name="person-outline" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function StatusCard({ stepAtual }: { stepAtual: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Status da Vaga</Text>
      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isDone = index < stepAtual;
          const isCurrent = index === stepAtual;
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step} style={styles.stepItem}>
              {/* Linha + dot na mesma linha horizontal */}
              <View style={styles.stepDotRow}>
                {/* Linha esquerda */}
                {index > 0 && (
                  <View style={[styles.stepLineLeft, { backgroundColor: isDone || isCurrent ? colors.primary : colors.border }]} />
                )}
                {/* Dot */}
                <View
                  style={[
                    styles.stepDot,
                    (isDone || isCurrent) && styles.stepDotActive,
                    isCurrent && styles.stepDotCurrent,
                  ]}
                />
                {/* Linha direita */}
                {!isLast && (
                  <View style={[styles.stepLineRight, { backgroundColor: isDone ? colors.primary : colors.border }]} />
                )}
              </View>
              <Text style={[styles.stepLabel, (isDone || isCurrent) && styles.stepLabelActive]}>
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type CtaConfig = { label: string; nextStep: number | null };

function getCtaConfig(step: number, temCandidatoAceito: boolean): CtaConfig {
  if (step === 1 && !temCandidatoAceito) return { label: "Aceitar Candidato", nextStep: null };
  if (step === 1 && temCandidatoAceito)  return { label: "Confirmar Seleção", nextStep: 2 };
  if (step === 2) return { label: "Confirmar Pagamento", nextStep: 3 };
  if (step === 3) return { label: "Check-in", nextStep: 4 };
  if (step === 4) return { label: "Check-out", nextStep: 5 };
  if (step === 5) return { label: "Confirmar Repasse", nextStep: 6 };
  if (step === 6) return { label: "Avaliar", nextStep: null };
  return { label: "Avançar", nextStep: step + 1 };
}

export default function VagaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null);

  const vagaBase: VagaDetalhe | null = null;
  const [stepAtual, setStepAtual] = useState(0);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);

  const temCandidatoAceito = candidatos.some((c) => c.status === "aceito");
  const totalAceitos = candidatos.filter((c) => c.status === "aceito").length;
  const mostrarCandidatos = stepAtual <= 1;

  const [checkinCode, setCheckinCode] = useState<string | null>(null);
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);
  const [avaliarVisible, setAvaliarVisible] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [compareceu, setCompareceu] = useState<boolean | null>(null);

  const cta = getCtaConfig(stepAtual, temCandidatoAceito);

  if (!vagaBase) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <TouchableOpacity style={[styles.backBtn, { position: "absolute", top: insets.top + 16, left: 16 }]} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: colors.muted }}>Vaga não encontrada</Text>
      </View>
    );
  }

  const vaga = { ...(vagaBase as VagaDetalhe), stepAtual };

  function gerarCodigo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  function handleCta() {
    if (stepAtual === 3) { setCheckinCode(gerarCodigo()); return; }
    if (stepAtual === 4) { setCheckoutCode(gerarCodigo()); return; }
    if (stepAtual === 6) { setAvaliarVisible(true); return; }
    if (cta.nextStep !== null) setStepAtual(cta.nextStep);
  }

  function handleConfirmarAvaliacao() {
    setAvaliarVisible(false);
    setEstrelas(0);
    setComentario("");
    setCompareceu(null);
    router.back();
  }

  function handleAceitarCandidato(candidatoId: string) {
    setCandidatos((prev) =>
      prev.map((c) =>
        c.id === candidatoId
          ? { ...c, status: "aceito" }
          : c.status === "aceito"
          ? { ...c, status: "pendente" }
          : c
      )
    );
  }

  function handleRecusarCandidato(candidatoId: string) {
    setCandidatos((prev) =>
      prev.map((c) => (c.id === candidatoId ? { ...c, status: "recusado" } : c))
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing["6"] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        {/* overlay badge — unique to header */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{vaga.statusLabel}</Text>
        </View>
        <Text style={styles.headerTitle}>{vaga.titulo}</Text>
        <Text style={styles.headerSubtitle}>{vaga.subtitulo}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard vaga={vaga} />

        {/* Endereço */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Endereço</Text>
          <Text style={styles.cardBody}>{vaga.endereco}</Text>
        </View>

        {/* Descrição */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Descrição</Text>
          <Text style={styles.cardBody}>{vaga.descricao}</Text>
        </View>

        {/* Candidatos — visível apenas nos steps iniciais */}
        {mostrarCandidatos && (
          <View style={styles.card}>
            <View style={styles.candidatosHeader}>
              <Text style={styles.cardLabel}>Candidatos ({candidatos.length})</Text>
              {totalAceitos > 0 && (
                <Text style={styles.aceitosLabel}>{totalAceitos} aceito</Text>
              )}
            </View>
            {candidatos.map((c, i) => (
              <CandidatoRow
                key={c.id}
                item={c}
                showDivider={i > 0}
                onVerPerfil={() => setSelectedCandidato(c)}
                onAceitar={() => handleAceitarCandidato(c.id)}
                onRecusar={() => handleRecusarCandidato(c.id)}
              />
            ))}
          </View>
        )}

        <StatusCard stepAtual={stepAtual} />
      </ScrollView>

      {/* Botões fixos */}
      <BottomActionBar backgroundColor="#F0F0F0" style={styles.bottomBarGap}>
        <TouchableOpacity style={styles.checkinBtn} activeOpacity={0.85} onPress={handleCta}>
          <Text style={styles.checkinBtnText}>{cta.label}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </BottomActionBar>

      <CodeModal
        visible={checkinCode !== null}
        code={checkinCode}
        title="Código de Check-in"
        confirmLabel="Freelancer confirmou o código"
        onClose={() => setCheckinCode(null)}
        onConfirm={() => { setCheckinCode(null); setStepAtual(4); }}
      />

      <CodeModal
        visible={checkoutCode !== null}
        code={checkoutCode}
        title="Código de Check-out"
        confirmLabel="Freelancer confirmou o código"
        onClose={() => setCheckoutCode(null)}
        onConfirm={() => { setCheckoutCode(null); setStepAtual(5); }}
      />

      {/* Modal Avaliar */}
      <CenteredModal
        visible={avaliarVisible}
        onClose={() => setAvaliarVisible(false)}
        contentStyle={styles.avaliarModal}
      >
        <Text style={styles.avaliarTitle}>Faça uma avaliação</Text>

        {/* Estrelas */}
        <View style={styles.avaliarStars}>
          <StarRating count={estrelas} size={36} interactive onPress={setEstrelas} />
        </View>

        {/* Comentário */}
        <TextInput
          style={styles.avaliarInput}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.muted}
          value={comentario}
          onChangeText={setComentario}
          multiline
          textAlignVertical="top"
        />

        {/* Compareceu */}
        <Text style={styles.avaliarPergunta}>O freelancer compareceu ao serviço?</Text>
        <View style={styles.avaliarRespostas}>
          <TouchableOpacity
            style={[styles.avaliarBtn, { backgroundColor: compareceu === true ? "#16A34A" : "#DCFCE7" }]}
            onPress={() => setCompareceu(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.avaliarBtnText, { color: compareceu === true ? colors.white : "#16A34A" }]}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avaliarBtn, { backgroundColor: compareceu === false ? "#DC2626" : "#FEE2E2" }]}
            onPress={() => setCompareceu(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.avaliarBtnText, { color: compareceu === false ? colors.white : "#DC2626" }]}>Não</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmar */}
        <TouchableOpacity style={styles.avaliarConfirmarBtn} onPress={handleConfirmarAvaliacao} activeOpacity={0.85}>
          <Text style={styles.avaliarConfirmarBtnText}>Confirmar</Text>
        </TouchableOpacity>
      </CenteredModal>

      <FreelancerProfileSheet
        visible={selectedCandidato !== null}
        onClose={() => setSelectedCandidato(null)}
        nome={selectedCandidato?.nome ?? ""}
        iniciais={selectedCandidato?.iniciais ?? ""}
        avaliacoes={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing["8"],
    paddingBottom: spacing["16"] + spacing["10"],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["8"],
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: radii.full,
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["2"],
    marginBottom: spacing["6"],
  },
  statusBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.dark,
  },
  headerTitle: {
    fontSize: fontSizes["3xl"],
    fontWeight: fontWeights.bold,
    color: colors.dark,
    marginBottom: spacing["2"],
  },
  headerSubtitle: {
    fontSize: fontSizes.md,
    color: colors.inkButton,
  },

  // Scroll
  scroll: {
    flex: 1,
    marginTop: -(spacing["16"] + spacing["6"]),
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["2"],
    gap: spacing["8"],
  },

  // Card base
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["8"],
    gap: spacing["6"],
    ...cardShadowStrong,
  },
  cardLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  cardBody: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Info card
  infoTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoCol: {
    flex: 1,
    flexDirection: "row",
    gap: spacing["6"],
    alignItems: "flex-start",
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: "#FEF3DC",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginBottom: spacing["1"],
  },
  infoValueBold: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  infoValueMuted: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginTop: spacing["1"],
  },
  infoBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoBottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
  },
  infoDuracao: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  infoValor: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },

  // Candidatos
  candidatosHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aceitosLabel: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  candidatoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["5"],
    gap: spacing["6"],
  },
  candidatoInfo: {
    flex: 1,
    gap: spacing["1"],
  },
  candidatoNome: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  candidatoCargo: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  candidatoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  candidatoMetaText: {
    fontSize: fontSizes.base,
    color: colors.muted,
  },
  candidatoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    flexShrink: 0,
  },
  actionBtnGreen: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnRed: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnGray: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Status steps
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing["4"],
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing["3"],
  },
  stepDotRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  stepLineLeft: {
    flex: 1,
    height: 2,
  },
  stepLineRight: {
    flex: 1,
    height: 2,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    width: 14,
    height: 14,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  stepLabel: {
    fontSize: fontSizes.xs,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 13,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // Bottom bar gap (applied as style prop to BottomActionBar)
  bottomBarGap: {
    gap: spacing["4"],
  },
  checkinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  checkinBtnText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
  cancelBtn: {
    backgroundColor: "#E8534A",
    borderRadius: radii.lg,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },

  // Modal check-in / check-out
  checkinModal: {
    gap: spacing["10"],
  },
  checkinClose: {
    alignSelf: "flex-end",
  },
  checkinModalText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    lineHeight: 26,
  },
  checkinCodeBox: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing["10"],
    alignItems: "center",
    justifyContent: "center",
  },
  checkinCode: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: colors.dark,
    letterSpacing: 4,
  },
  checkinConfirmBtn: {
    backgroundColor: colors.dark,
    borderRadius: radii.lg,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  checkinConfirmBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },

  // Modal avaliar
  avaliarModal: {
    gap: spacing["8"],
  },
  avaliarTitle: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  avaliarStars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing["6"],
  },
  avaliarInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: radii.lg,
    padding: spacing["8"],
    height: 120,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  avaliarPergunta: {
    fontSize: fontSizes.md,
    color: colors.ink,
    textAlign: "center",
  },
  avaliarRespostas: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing["8"],
  },
  avaliarBtn: {
    borderRadius: radii.lg,
    paddingVertical: spacing["6"],
    paddingHorizontal: spacing["16"],
  },
  avaliarBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  avaliarConfirmarBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  avaliarConfirmarBtnText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.dark,
  },
});
