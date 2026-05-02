import { AvatarInitials } from "@/components/avatar-initials";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { CenteredModal } from "@/components/centered-modal";
import { Divider } from "@/components/divider";
import { FreelancerProfileSheet } from "@/components/freelancer-profile-sheet";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { candidaturasService } from "@/services/candidaturas.service";
import { feedbacksService } from "@/services/feedbacks.service";
import { jobsService } from "@/services/jobs.service";
import { vagasService } from "@/services/vagas.service";
import type { CandidatoApi, JobApi, VagaDetalheApi } from "@/types/vagas";
import { formatVagaValue, mapApiStatusToStep } from "@/utils/vaga-status-map";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

type InfoCardProps = {
  vaga: VagaDetalheApi;
};

function InfoCard({ vaga }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.infoTopRow}>
        <View style={styles.infoCol}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Data e Horário</Text>
            <Text style={styles.infoValueBold}>{vaga.date ?? "—"}</Text>
            <Text style={styles.infoValueMuted}>{vaga.startTime ?? "—"}</Text>
          </View>
        </View>
        <Divider orientation="vertical" />
        <View style={styles.infoCol}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Local</Text>
            <Text style={styles.infoValueBold}>{vaga.location ?? "—"}</Text>
          </View>
        </View>
      </View>

      <Divider />

      <View style={styles.infoBottomRow}>
        <View style={styles.infoBottomLeft}>
          <Ionicons name="hourglass-outline" size={15} color={colors.muted} />
          <Text style={styles.infoDuracao}>
            {vaga.duration ? `Duração: ${vaga.duration}` : "Duração não informada"}
          </Text>
        </View>
        <Text style={styles.infoValor}>
          {formatVagaValue(vaga.value as number | undefined)}
        </Text>
      </View>
    </View>
  );
}

type CandidatoRowProps = {
  item: CandidatoApi;
  showDivider: boolean;
  onVerPerfil: () => void;
  onAceitar?: () => void;
  onRecusar?: () => void;
};

function CandidatoRow({ item, showDivider, onVerPerfil, onAceitar, onRecusar }: CandidatoRowProps) {
  const isAceito = item.status === "accepted";
  const isRecusado = item.status === "rejected";
  const initials = item.name
    ? item.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <>
      {showDivider && <Divider />}
      <View style={styles.candidatoRow}>
        <AvatarInitials initials={initials} size={40} backgroundColor={colors.primary} />
        <View style={styles.candidatoInfo}>
          <Text style={styles.candidatoNome}>{item.name ?? "Candidato"}</Text>
          <Text style={styles.candidatoCargo}>{item.role ?? ""}</Text>
          {item.rating != null && (
            <View style={styles.candidatoMeta}>
              <Ionicons name="star" size={11} color={colors.primary} />
              <Text style={styles.candidatoMetaText}>
                {item.rating}
                {item.reviewCount != null && ` (${item.reviewCount})`}
                {item.jobCount != null && ` • ${item.jobCount} jobs`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.candidatoActions}>
          {isAceito && <StatusBadge status="aceito" label="Aceito" />}
          {isRecusado && <StatusBadge status="recusado" label="Recusado" />}
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
              <View style={styles.stepDotRow}>
                {index > 0 && (
                  <View
                    style={[
                      styles.stepLineLeft,
                      { backgroundColor: isDone || isCurrent ? colors.primary : colors.border },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.stepDot,
                    (isDone || isCurrent) && styles.stepDotActive,
                    isCurrent && styles.stepDotCurrent,
                  ]}
                />
                {!isLast && (
                  <View
                    style={[
                      styles.stepLineRight,
                      { backgroundColor: isDone ? colors.primary : colors.border },
                    ]}
                  />
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
  if (step === 1 && temCandidatoAceito) return { label: "Confirmar Seleção", nextStep: 2 };
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
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [vaga, setVaga] = useState<VagaDetalheApi | null>(null);
  const [candidatos, setCandidatos] = useState<CandidatoApi[]>([]);
  const [job, setJob] = useState<JobApi | null>(null);
  const [stepAtual, setStepAtual] = useState(0);

  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoApi | null>(null);
  const [checkinCode, setCheckinCode] = useState<string | null>(null);
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);
  const [avaliarVisible, setAvaliarVisible] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [compareceu, setCompareceu] = useState<boolean | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [vagaData, candidatosData] = await Promise.all([
        vagasService.getById(id),
        candidaturasService.listByVacancy(id),
      ]);
      setVaga(vagaData);
      setCandidatos(candidatosData);
      setStepAtual(mapApiStatusToStep(vagaData.status));

      try {
        const jobData = await jobsService.getByVacancy(id);
        setJob(jobData);
        setStepAtual(mapApiStatusToStep(jobData.status));
      } catch {
        // job pode não existir ainda para vagas abertas
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const temCandidatoAceito = candidatos.some((c) => c.status === "accepted");
  const totalAceitos = candidatos.filter((c) => c.status === "accepted").length;
  const mostrarCandidatos = stepAtual <= 1;
  const cta = getCtaConfig(stepAtual, temCandidatoAceito);

  async function handleAceitarCandidato(candidatoId: string) {
    await candidaturasService.accept(candidatoId);
    setCandidatos((prev) =>
      prev.map((c) =>
        c.id === candidatoId
          ? { ...c, status: "accepted" as const }
          : c.status === "accepted"
          ? { ...c, status: "pending" as const }
          : c
      )
    );
  }

  async function handleRecusarCandidato(candidatoId: string) {
    await candidaturasService.reject(candidatoId);
    setCandidatos((prev) =>
      prev.map((c) => (c.id === candidatoId ? { ...c, status: "rejected" as const } : c))
    );
  }

  async function handleCta() {
    if (stepAtual === 3) {
      if (!job) return;
      const code = await jobsService.generateCheckinCode(job.id);
      setCheckinCode(code);
      return;
    }
    if (stepAtual === 4) {
      if (!job) return;
      const code = await jobsService.generateCheckoutCode(job.id);
      setCheckoutCode(code);
      return;
    }
    if (stepAtual === 6) {
      setAvaliarVisible(true);
      return;
    }
    if (cta.nextStep !== null) setStepAtual(cta.nextStep);
  }

  async function handleConfirmarAvaliacao() {
    if (!job) return;
    await feedbacksService.create({
      jobId: job.id,
      rating: estrelas,
      comment: comentario,
    });
    toast.success("Avaliação enviada!");
    setAvaliarVisible(false);
    setEstrelas(0);
    setComentario("");
    setCompareceu(null);
    router.back();
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!vaga) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>Vaga não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing["6"] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{vaga.status}</Text>
        </View>
        <Text style={styles.headerTitle}>{vaga.title}</Text>
        <Text style={styles.headerSubtitle}>{vaga.location ?? ""}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard vaga={vaga} />

        {vaga.address ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Endereço</Text>
            <Text style={styles.cardBody}>{vaga.address}</Text>
          </View>
        ) : null}

        {vaga.description ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Descrição</Text>
            <Text style={styles.cardBody}>{vaga.description}</Text>
          </View>
        ) : null}

        {mostrarCandidatos && (
          <View style={styles.card}>
            <View style={styles.candidatosHeader}>
              <Text style={styles.cardLabel}>Candidatos ({candidatos.length})</Text>
              {totalAceitos > 0 && (
                <Text style={styles.aceitosLabel}>{totalAceitos} aceito</Text>
              )}
            </View>
            {candidatos.length === 0 ? (
              <Text style={styles.cardBody}>Nenhum candidato ainda.</Text>
            ) : (
              candidatos.map((c, i) => (
                <CandidatoRow
                  key={c.id}
                  item={c}
                  showDivider={i > 0}
                  onVerPerfil={() => setSelectedCandidato(c)}
                  onAceitar={() => handleAceitarCandidato(c.id)}
                  onRecusar={() => handleRecusarCandidato(c.id)}
                />
              ))
            )}
          </View>
        )}

        <StatusCard stepAtual={stepAtual} />
      </ScrollView>

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

      <CenteredModal
        visible={avaliarVisible}
        onClose={() => setAvaliarVisible(false)}
        contentStyle={styles.avaliarModal}
      >
        <Text style={styles.avaliarTitle}>Faça uma avaliação</Text>

        <View style={styles.avaliarStars}>
          <StarRating count={estrelas} size={36} interactive onPress={setEstrelas} />
        </View>

        <TextInput
          style={styles.avaliarInput}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.muted}
          value={comentario}
          onChangeText={setComentario}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.avaliarPergunta}>O freelancer compareceu ao serviço?</Text>
        <View style={styles.avaliarRespostas}>
          <TouchableOpacity
            style={[styles.avaliarBtn, { backgroundColor: compareceu === true ? "#16A34A" : "#DCFCE7" }]}
            onPress={() => setCompareceu(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.avaliarBtnText, { color: compareceu === true ? colors.white : "#16A34A" }]}>
              Sim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avaliarBtn, { backgroundColor: compareceu === false ? "#DC2626" : "#FEE2E2" }]}
            onPress={() => setCompareceu(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.avaliarBtnText, { color: compareceu === false ? colors.white : "#DC2626" }]}>
              Não
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.avaliarConfirmarBtn}
          onPress={handleConfirmarAvaliacao}
          activeOpacity={0.85}
        >
          <Text style={styles.avaliarConfirmarBtnText}>Confirmar</Text>
        </TouchableOpacity>
      </CenteredModal>

      <FreelancerProfileSheet
        visible={selectedCandidato !== null}
        onClose={() => setSelectedCandidato(null)}
        nome={selectedCandidato?.name ?? ""}
        iniciais={
          selectedCandidato?.name
            ? selectedCandidato.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
            : "??"
        }
        avaliacoes={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: fontSizes.lg,
    color: colors.muted,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },

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
