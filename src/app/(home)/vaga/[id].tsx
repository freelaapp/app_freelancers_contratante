import { AvatarInitials } from "@/components/avatar-initials";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { CenteredModal } from "@/components/centered-modal";
import { Divider } from "@/components/divider";
import { FreelancerProfileSheet } from "@/components/freelancer-profile-sheet";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import { cardShadowStrong, colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";
import { candidaturasService } from "@/services/candidaturas.service";
import { feedbacksService } from "@/services/feedbacks.service";
import { jobsService } from "@/services/jobs.service";
import { paymentsService } from "@/services/payments.service";
import type { PaymentResponse } from "@/services/payments.service";
import { vagasService } from "@/services/vagas.service";
import type { CandidatoApi, JobApi, VagaDetalheApi } from "@/types/vagas";
import { goBackOrReplace } from "@/utils/navigation";
import { formatVagaValue, mapApiStatusToStep } from "@/utils/vaga-status-map";
import { debug } from "@/utils/debug";
import { toast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatApiDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatApiTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mn = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mn}`;
}

function calcDuration(startIso?: string, endIso?: string): string {
  if (!startIso || !endIso) return "—";
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  return hours > 0 ? `${hours}h` : "—";
}

function buildQrCodeUri(qrCodeImage?: string | null): string | null {
  if (!qrCodeImage) return null;
  const value = qrCodeImage.trim();
  if (!value) return null;

  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  return `data:image/png;base64,${value}`;
}

const PIX_TTL_MS = 30 * 60 * 1000;

function parseIsoToMs(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

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
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function CodeModal({ visible, code, title, confirmLabel, loading, onClose, onConfirm }: CodeModalProps) {
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
        style={[styles.checkinConfirmBtn, loading && { opacity: 0.7 }]}
        activeOpacity={0.85}
        onPress={onConfirm}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} size="small" />
          : <Text style={styles.checkinConfirmBtnText}>{confirmLabel}</Text>
        }
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
            <Text style={styles.infoValueBold}>{formatApiDate(vaga.date as string | undefined)}</Text>
            <Text style={styles.infoValueMuted}>{formatApiTime(vaga.startTime as string | undefined)}</Text>
          </View>
        </View>
        <Divider orientation="vertical" />
        <View style={styles.infoCol}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Início</Text>
            <Text style={styles.infoValueBold}>{formatApiTime(vaga.startTime as string | undefined)}</Text>
            <Text style={[styles.infoLabel, { marginTop: spacing["3"] }]}>Término</Text>
            <Text style={styles.infoValueBold}>{formatApiTime(vaga.endTime as string | undefined)}</Text>
          </View>
        </View>
      </View>

      <Divider />

      <View style={styles.infoBottomRow}>
        <View style={styles.infoBottomLeft}>
          <Ionicons name="hourglass-outline" size={15} color={colors.muted} />
          <Text style={styles.infoDuracao}>
            {`Duração: ${calcDuration(vaga.startTime as string | undefined, vaga.endTime as string | undefined)}`}
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
  index: number;
  showDivider: boolean;
  onVerPerfil: () => void;
  onAceitar?: () => void;
  onRecusar?: () => void;
};

function CandidatoRow({ item, index, showDivider, onVerPerfil, onAceitar, onRecusar }: CandidatoRowProps) {
  const normalizedStatus = (item.status as string).toLowerCase();
  const isAceito = normalizedStatus === "accepted";
  const isRecusado = normalizedStatus === "rejected";
  const displayName = item.name ?? `Freelancer ${index + 1}`;
  const initials = item.name
    ? item.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : `${index + 1}`;

  return (
    <>
      {showDivider && <Divider />}
      <View style={styles.candidatoRow}>
        <AvatarInitials initials={initials} size={40} backgroundColor={colors.primary} imageUrl={item.avatarUrl as string | null | undefined} />
        <View style={styles.candidatoInfo}>
          <Text style={styles.candidatoNome}>{displayName}</Text>
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
          {isAceito && (
            <View style={styles.candidatoStatusRow}>
              <StatusBadge status="aceito" label="Aceito" />
            </View>
          )}
          {isRecusado && (
            <View style={styles.candidatoStatusRow}>
              <StatusBadge status="recusado" label="Recusado" />
            </View>
          )}
        </View>
        <View style={styles.candidatoActions}>
          {!isAceito && (
            <TouchableOpacity testID={`btn-aceitar-${item.id}`} style={styles.actionBtnGreen} activeOpacity={0.7} onPress={onAceitar}>
              <Ionicons name="person-add-outline" size={16} color="#16A34A" />
            </TouchableOpacity>
          )}
          {!isAceito && !isRecusado && (
            <TouchableOpacity style={styles.actionBtnRed} activeOpacity={0.7} onPress={onRecusar}>
              <Ionicons name="person-remove-outline" size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtnGray} activeOpacity={0.7} onPress={onVerPerfil}>
            <Ionicons name="person-outline" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function StepperItem({ label, status }: { label: string; status: "done" | "current" | "pending" }) {
  const isDone = status === "done";
  const isCurrent = status === "current";
  const isPending = status === "pending";

  return (
    <View style={stepperStyles.container}>
      <View
        style={[
          stepperStyles.dot,
          isDone && stepperStyles.dotDone,
          isCurrent && stepperStyles.dotCurrent,
          isPending && stepperStyles.dotPending,
        ]}
      >
        {isDone && <Ionicons name="checkmark" size={8} color={colors.white} />}
      </View>

      <Text
        style={[
          stepperStyles.label,
          isDone && stepperStyles.labelDone,
          isCurrent && stepperStyles.labelCurrent,
          isPending && stepperStyles.labelPending,
        ]}
      >
        {label}
      </Text>

      {isDone && (
        <View style={[stepperStyles.dot, stepperStyles.dotConfirm]}>
          <Ionicons name="checkmark" size={8} color={colors.white} />
        </View>
      )}
    </View>
  );
}

function StatusCard({ stepAtual }: { stepAtual: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Status da Vaga</Text>
      <View style={stepperStyles.list}>
        {STEPS.map((step, index) => {
          const status: "done" | "current" | "pending" =
            index < stepAtual ? "done" : index === stepAtual ? "current" : "pending";
          return <StepperItem key={step} label={step} status={status} />;
        })}
      </View>
    </View>
  );
}

type CtaConfig = { label: string; nextStep: number | null };

function getCtaConfig(step: number, temCandidatoAceito: boolean): CtaConfig {
  if (step === 1 && !temCandidatoAceito) return { label: "Aceitar Candidato", nextStep: null };
  if (step === 1 && temCandidatoAceito) return { label: "Confirmar Seleção", nextStep: 2 };
  if (step === 2) return { label: "Pagar", nextStep: 3 };
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
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [vaga, setVaga] = useState<VagaDetalheApi | null>(null);
  const [candidatos, setCandidatos] = useState<CandidatoApi[]>([]);
  const [job, setJob] = useState<JobApi | null>(null);
  const [stepAtual, setStepAtual] = useState(0);

  const [selectedCandidato, setSelectedCandidato] = useState<CandidatoApi | null>(null);
  const [checkinCode, setCheckinCode] = useState<string | null>(null);
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);
  const [checkinConfirming, setCheckinConfirming] = useState(false);
  const [checkoutConfirming, setCheckoutConfirming] = useState(false);
  const [avaliarVisible, setAvaliarVisible] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [compareceu, setCompareceu] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentConfirming, setPaymentConfirming] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentLocalCreatedAtMs, setPaymentLocalCreatedAtMs] = useState<number | null>(null);

  const paymentPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentIdRef = useRef<string>("");
  const paymentCreatedAtRef = useRef<number>(0);
  const paymentValueCentsRef = useRef<number>(0);
  const pixRefreshInFlightRef = useRef(false);
  const pixRefreshLastAtRef = useRef<number>(0);
  const paymentQrCodeUri = buildQrCodeUri(paymentData?.qrCodeImage);

  const [pixNow, setPixNow] = useState(() => Date.now());
  const paymentCreatedAtMs =
    paymentLocalCreatedAtMs ?? paymentCreatedAtRef.current ?? parseIsoToMs(paymentData?.createdAt);
  const paymentExpiresAtMs = paymentCreatedAtMs != null ? paymentCreatedAtMs + PIX_TTL_MS : null;
  const pixExpiresInMs = paymentExpiresAtMs != null ? paymentExpiresAtMs - pixNow : null;
  const pixIsExpired = paymentExpiresAtMs != null ? pixNow >= paymentExpiresAtMs : false;

  const refreshPix = useCallback(
    async (reason: "manual" | "expired") => {
      if (!id) return;
      if (pixRefreshInFlightRef.current) return;
      if (!paymentValueCentsRef.current) return;

      // evita loop em caso de erro/instabilidade
      const now = Date.now();
      if (reason === "expired" && now - pixRefreshLastAtRef.current < 15_000) return;

      pixRefreshInFlightRef.current = true;
      pixRefreshLastAtRef.current = now;
      setPaymentPolling(true);
      try {
        const updated = job?.id
          ? await paymentsService.createJobPayment(job.id, paymentValueCentsRef.current)
          : await paymentsService.createVacancyPayment(id, paymentValueCentsRef.current);
        setPaymentData(updated);
        setPaymentLocalCreatedAtMs(Date.now());
        paymentIdRef.current = updated.id;
        paymentCreatedAtRef.current = Date.now();
      } catch {
        toast.error("Não foi possível gerar um novo PIX agora. Tente novamente.");
      } finally {
        setPaymentPolling(false);
        pixRefreshInFlightRef.current = false;
      }
    },
    [id, job?.id]
  );

  const syncPix = useCallback(async () => {
    if (!id) return;
    setPaymentPolling(true);
    try {
      const updated = job?.id
        ? await paymentsService.getJobPayment(job.id, true)
        : await paymentsService.getVacancyPayment(id, true);
      setPaymentData(updated);
      if (updated.id && updated.id !== paymentIdRef.current) {
        paymentIdRef.current = updated.id;
        paymentCreatedAtRef.current = Date.now();
        setPaymentLocalCreatedAtMs(Date.now());
      }
    } catch {
      toast.error("Não foi possível atualizar o PIX agora. Tente novamente.");
    } finally {
      setPaymentPolling(false);
    }
  }, [id, job?.id]);

  useEffect(() => {
    if (!paymentModalVisible) return;
    debug.log("VagaDetailPayment", "estado do modal PIX", {
      paymentData,
      paymentQrCodeUri,
      hasQrCodeImage: Boolean(paymentData?.qrCodeImage),
      hasBrCode: Boolean(paymentData?.brCode),
      paymentPolling,
    });
  }, [paymentModalVisible, paymentData, paymentQrCodeUri, paymentPolling]);

  useEffect(() => {
    if (!paymentModalVisible) return;
    const t = setInterval(() => setPixNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [paymentModalVisible]);

  useEffect(() => {
    if (!paymentModalVisible) return;
    if (!pixIsExpired) return;
    refreshPix("expired");
  }, [paymentModalVisible, pixIsExpired, refreshPix]);

  useEffect(() => {
    if (!paymentModalVisible) {
      if (paymentPollRef.current) {
        clearInterval(paymentPollRef.current);
        paymentPollRef.current = null;
      }
      setPaymentPolling(false);
      setPaymentLocalCreatedAtMs(null);
      return;
    }

    if (paymentPollRef.current) return;

    paymentPollRef.current = setInterval(async () => {
      try {
        const updated = job?.id
          ? await paymentsService.getJobPayment(job.id, true)
          : await paymentsService.getVacancyPayment(id ?? "", true);
        if (
          updated.id === paymentIdRef.current &&
          updated.status === "COMPLETED" &&
          Date.now() - paymentCreatedAtRef.current > 8000
        ) {
          clearInterval(paymentPollRef.current!);
          paymentPollRef.current = null;
          setPaymentModalVisible(false);
          setStepAtual(3);
          notifyStepChange(3, vaga?.title ?? "", id ?? "");
          toast.success("Pagamento confirmado!");
        }
      } catch {
        // ignore errors during polling
      }
    }, 5000);

    return () => {
      if (paymentPollRef.current) {
        clearInterval(paymentPollRef.current);
        paymentPollRef.current = null;
      }
    };
  }, [paymentModalVisible, id, job?.id]);

  function notifyStepChange(newStep: number, vagaTitle: string, vagaId: string) {
    const stepLabel = STEPS[newStep];
    if (!stepLabel) return;
    addNotification({
      vagaId,
      vagaTitle,
      title: `Atualização: ${vagaTitle}`,
      body: `Status avançou para "${stepLabel}"`,
    });
  }

  const loadData = useCallback(async () => {
    if (!id || !user?.module) return;
    try {
      const [vagaData, candidatosData] = await Promise.all([
        vagasService.getById(user.module, id),
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
        // se há candidato aceito mas step ficou em 0/1, avança para step 2
        setStepAtual((prev) =>
          prev <= 1 && candidatosData.some((c) => c.status === "accepted") ? 2 : prev
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, user?.module, user?.contractorId]);

  useEffect(() => {
    setLoading(true);
    setVaga(null);
    setCandidatos([]);
    setJob(null);
    setStepAtual(0);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const temCandidatoAceito = candidatos.some((c) => c.status === "accepted");
  const totalAceitos = candidatos.filter((c) => c.status === "accepted").length;
  const cta = getCtaConfig(stepAtual, temCandidatoAceito);

  async function handleAceitarCandidato(candidatoId: string) {
    try {
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
      setStepAtual(2);
      notifyStepChange(2, vaga?.title ?? "", id ?? "");
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(apiMessage ?? "Erro ao aceitar candidato. Tente novamente.");
    }
  }

  async function handleRecusarCandidato(candidatoId: string) {
    try {
      await candidaturasService.reject(candidatoId);
      setCandidatos((prev) =>
        prev.map((c) => (c.id === candidatoId ? { ...c, status: "rejected" as const } : c))
      );
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(apiMessage ?? "Erro ao recusar candidato. Tente novamente.");
    }
  }

  async function handleCta() {
    if (stepAtual === 2) {
      if (!vaga || !id) return;
      setPaymentLoading(true);
      try {
        const raw = vaga as Record<string, unknown>;
        const chargeValue =
          (typeof raw.payment === "number" && raw.payment > 0 ? raw.payment : undefined) ??
          (typeof raw.chargeAmountInCents === "number" && raw.chargeAmountInCents > 0 ? raw.chargeAmountInCents : undefined) ??
          (typeof raw.totalAmountInCents === "number" && raw.totalAmountInCents > 0 ? raw.totalAmountInCents : undefined) ??
          (typeof raw.hourlyRateInCents === "number" && raw.hourlyRateInCents > 0 ? raw.hourlyRateInCents : undefined) ??
          (typeof raw.value === "number" && raw.value > 0 ? Math.round(raw.value * 100) : undefined) ??
          0;

        if (chargeValue === 0) {
          toast.error("Valor da vaga não encontrado. Recarregue a tela.");
          setPaymentLoading(false);
          return;
        }

        const payment = job?.id
          ? await paymentsService.createJobPayment(job.id, chargeValue)
          : await paymentsService.createVacancyPayment(id, chargeValue);

        const hasQrData = Boolean(payment.qrCodeImage || payment.brCode);
        debug.log("VagaDetailPayment", "createVacancyPayment concluido", {
          payment,
          hasQrData,
        });
        setPaymentData(payment);
        setPaymentPolling(!hasQrData);
        setPaymentModalVisible(true);
        paymentIdRef.current = payment.id;
        paymentCreatedAtRef.current = Date.now();
        paymentValueCentsRef.current = chargeValue;
        setPaymentLocalCreatedAtMs(Date.now());

        if (!hasQrData) {
          let attempts = 0;
          const pollPayment = async (): Promise<void> => {
            if (attempts >= 5) {
              setPaymentPolling(false);
              return;
            }
            attempts++;
            try {
            const updated = job?.id
              ? await paymentsService.getJobPayment(job.id)
              : await paymentsService.getVacancyPayment(id ?? "");
              debug.log("VagaDetailPayment", "polling de QR/payment", {
                attempt: attempts,
                updated,
                hasQrData: Boolean(updated.qrCodeImage || updated.brCode),
              });
              setPaymentData(updated);
              if (updated.qrCodeImage || updated.brCode) {
                setPaymentPolling(false);
                return;
              }
            } catch {
              // ignore polling errors
            }
            setTimeout(pollPayment, 2000);
          };
          setTimeout(pollPayment, 2000);
        }
      } catch {
        // api.ts interceptor já exibe o toast de erro
      } finally {
        setPaymentLoading(false);
      }
      return;
    }
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
    if (cta.nextStep !== null) {
      setStepAtual(cta.nextStep);
      notifyStepChange(cta.nextStep, vaga?.title ?? "", id ?? "");
    }
  }

  async function handleConfirmarPagamento() {
    if (!id) return;
    setPaymentConfirming(true);
    try {
      const payment = job?.id
        ? await paymentsService.getJobPayment(job.id)
        : await paymentsService.getVacancyPayment(id);
      const isCompleted = payment.status === "COMPLETED" || payment.status === "PAID";
      if (isCompleted) {
        setPaymentModalVisible(false);
        setPaymentData(null);
        setPaymentPolling(false);
        setStepAtual(3);
        notifyStepChange(3, vaga?.title ?? "", id ?? "");
      } else {
        toast.error("Pagamento ainda não confirmado");
      }
    } catch {
      // api.ts interceptor já exibe o toast de erro
    } finally {
      setPaymentConfirming(false);
    }
  }

  async function handleConfirmCheckin() {
    if (!job || !user?.module) return;
    setCheckinConfirming(true);
    try {
      const confirmed = await jobsService.getCheckinStatus(user.module, job.id);
      if (confirmed) {
        setCheckinCode(null);
        setStepAtual(4);
        notifyStepChange(4, vaga?.title ?? "", id ?? "");
      } else {
        toast.error("O freelancer ainda não confirmou o check-in.");
      }
    } catch {
      toast.error("Erro ao verificar check-in. Tente novamente.");
    } finally {
      setCheckinConfirming(false);
    }
  }

  async function handleConfirmCheckout() {
    if (!job || !user?.module) return;
    setCheckoutConfirming(true);
    try {
      await jobsService.confirmCheckout(user.module, job.id);
      setCheckoutCode(null);
      setStepAtual(5);
      notifyStepChange(5, vaga?.title ?? "", id ?? "");
      toast.success("Check-out confirmado!");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error("O freelancer ainda não confirmou o check-out.");
      } else {
        toast.error("Erro ao confirmar check-out. Tente novamente.");
      }
    } finally {
      setCheckoutConfirming(false);
    }
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
    goBackOrReplace(router, "/(home)");
  }

  async function handleDeleteVaga() {
    setDeleteConfirmVisible(true);
  }

  async function confirmDelete() {
    if (!user?.module || !id) return;
    setDeleting(true);
    try {
      await vagasService.delete(user.module as "home-services" | "bars-restaurants", id);
      toast.success("Vaga excluída com sucesso!");
      setDeleteConfirmVisible(false);
      goBackOrReplace(router, "/(home)");
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(apiMessage ?? "Erro ao excluir a vaga. Tente novamente.");
    } finally {
      setDeleting(false);
    }
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => goBackOrReplace(router, "/(home)")}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>{vaga.status}</Text>
        </View>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { flex: 1 }]}>{vaga.title}</Text>
          <TouchableOpacity
            testID="btn-excluir-vaga"
            style={styles.deleteTextBtn}
            onPress={handleDeleteVaga}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteTextBtnLabel}>Excluir vaga</Text>
          </TouchableOpacity>
        </View>
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
                  key={c.id ?? `candidato-${i}`}
                  item={c}
                  index={i}
                  showDivider={i > 0}
                  onVerPerfil={() => setSelectedCandidato(c)}
                  onAceitar={() => handleAceitarCandidato(c.id)}
                  onRecusar={() => handleRecusarCandidato(c.id)}
                />
              ))
            )}
          </View>

        <StatusCard stepAtual={stepAtual} />
      </ScrollView>

      <BottomActionBar backgroundColor="#F0F0F0" style={styles.bottomBarGap}>
        {stepAtual > 1 && (
          <TouchableOpacity
            style={[styles.checkinBtn, paymentLoading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleCta}
            disabled={paymentLoading}
          >
            {paymentLoading
              ? <ActivityIndicator color={colors.dark} size="small" />
              : <Text style={styles.checkinBtnText}>{cta.label}</Text>
            }
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.85}
          onPress={() => goBackOrReplace(router, "/(home)")}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </BottomActionBar>

      <CodeModal
        visible={checkinCode !== null}
        code={checkinCode}
        title="Código de Check-in"
        confirmLabel="Freelancer confirmou o código"
        loading={checkinConfirming}
        onClose={() => setCheckinCode(null)}
        onConfirm={handleConfirmCheckin}
      />

      <CodeModal
        visible={checkoutCode !== null}
        code={checkoutCode}
        title="Código de Check-out"
        confirmLabel="Freelancer confirmou o código"
        loading={checkoutConfirming}
        onClose={() => setCheckoutCode(null)}
        onConfirm={handleConfirmCheckout}
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

      <CenteredModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        contentStyle={styles.pixModal}
      >
        <TouchableOpacity style={styles.checkinClose} onPress={() => setPaymentModalVisible(false)} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.pixTitle}>Pagamento via PIX</Text>

        {paymentData && (
          <Text style={styles.pixValue}>
            {formatVagaValue(paymentData.value / 100)}
          </Text>
        )}

        <View style={styles.pixMetaRow}>
          <Text style={styles.pixMetaText}>
            {pixExpiresInMs == null
              ? "Validade: —"
              : pixIsExpired
              ? "PIX expirado"
              : `Expira em ${formatCountdown(pixExpiresInMs)}`}
          </Text>

          {paymentData?.id ? (
            <Text style={styles.pixMetaText}>
              Cobrança: {paymentData.id} | Gerado em {formatApiTime(paymentData.createdAt)}
            </Text>
          ) : null}

          <View style={styles.pixRefreshRow}>
            <TouchableOpacity
              style={[styles.pixRefreshBtn, paymentPolling && { opacity: 0.6 }]}
              onPress={syncPix}
              disabled={paymentPolling}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.pixRefreshBtnText}>Atualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pixRefreshBtn, paymentPolling && { opacity: 0.6 }]}
              onPress={() => refreshPix("manual")}
              disabled={paymentPolling}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
              <Text style={styles.pixRefreshBtnText}>Gerar novo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {paymentPolling ? (
          <View style={styles.pixPollingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.pixPollingText}>Gerando QR Code...</Text>
          </View>
        ) : (
          <>
            {paymentQrCodeUri ? (
              <View style={styles.pixQrWrapper}>
                <Image
                  source={{ uri: paymentQrCodeUri }}
                  style={styles.pixQrImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.pixQrFallback}>
                <Ionicons name="qr-code-outline" size={60} color={colors.muted} />
                <Text style={styles.pixFallbackText}>QR Code indisponível</Text>
                <Text style={styles.pixFallbackText}>Use a chave PIX abaixo para pagar manualmente</Text>
              </View>
            )}

            {paymentData?.brCode ? (
              <View style={styles.pixBrCodeBox}>
                <Text style={styles.pixOrLabel}>ou</Text>
                <TextInput
                  style={styles.pixBrCodeInput}
                  value={paymentData.brCode}
                  editable={false}
                  multiline
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.pixCopyBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    Clipboard.setStringAsync(paymentData.brCode ?? "");
                    toast.success("Chave PIX copiada!");
                  }}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  <Text style={styles.pixCopyBtnText}>Copiar chave PIX</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.pixFallbackText}>Chave PIX não disponível. Contate o suporte.</Text>
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.checkinConfirmBtn, paymentConfirming && { opacity: 0.7 }]}
          activeOpacity={0.85}
          onPress={handleConfirmarPagamento}
          disabled={paymentConfirming}
        >
          {paymentConfirming
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.checkinConfirmBtnText}>Já paguei</Text>
          }
        </TouchableOpacity>
      </CenteredModal>

      <FreelancerProfileSheet
        visible={selectedCandidato !== null}
        onClose={() => setSelectedCandidato(null)}
        nome={
          selectedCandidato
            ? (selectedCandidato.name ?? `Freelancer ${(candidatos.indexOf(selectedCandidato) + 1) || ""}`)
            : ""
        }
        iniciais={
          selectedCandidato?.name
            ? selectedCandidato.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()
            : selectedCandidato
            ? `${candidatos.indexOf(selectedCandidato) + 1}`
            : ""
        }
        avatarUrl={selectedCandidato?.avatarUrl as string | null | undefined}
        avaliacoes={[]}
      />

      <CenteredModal
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        contentStyle={{ gap: spacing["8"] }}
      >
        <Text style={{ fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.ink }}>
          Excluir vaga
        </Text>
        <Text style={{ fontSize: fontSizes.base, color: colors.textSecondary }}>
          Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
        </Text>
        <TouchableOpacity
          style={[styles.checkinConfirmBtn, { backgroundColor: "#DC2626" }, deleting && { opacity: 0.7 }]}
          onPress={confirmDelete}
          disabled={deleting}
          activeOpacity={0.85}
        >
          {deleting
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.checkinConfirmBtnText}>Excluir</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkinConfirmBtn, { backgroundColor: colors.border }]}
          onPress={() => setDeleteConfirmVisible(false)}
          activeOpacity={0.85}
        >
          <Text style={[styles.checkinConfirmBtnText, { color: colors.ink }]}>Cancelar</Text>
        </TouchableOpacity>
      </CenteredModal>
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
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["2"],
  },
  deleteTextBtn: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radii.full,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    marginLeft: spacing["4"],
  },
  deleteTextBtnLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#DC2626",
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
  candidatoStatusRow: {
    marginTop: spacing["3"],
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

  stepsColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: spacing["4"],
    paddingHorizontal: spacing["2"],
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing["3"],
    minHeight: 40,
  },
  stepDotColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  stepLineTop: {
    width: 2,
    height: 20,
},
  stepLineBottom: {
    width: 2,
    height: 20,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
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

  pixModal: {
    gap: spacing["8"],
  },
  pixTitle: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: "center",
  },
  pixValue: {
    fontSize: fontSizes["3xl"],
    fontWeight: fontWeights.bold,
    color: colors.primary,
    textAlign: "center",
  },
  pixMetaRow: {
    gap: spacing["4"],
    alignItems: "center",
  },
  pixMetaText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: "center",
  },
  pixRefreshRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing["6"],
    flexWrap: "wrap",
  },
  pixRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["6"],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pixRefreshBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  pixQrWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  pixQrImage: {
    width: 200,
    height: 200,
  },
  pixBrCodeBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: radii.lg,
    padding: spacing["8"],
    gap: spacing["6"],
  },
  pixBrCodeText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 18,
  },
  pixCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["4"],
    alignSelf: "flex-start",
  },
  pixCopyBtnText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  pixPollingWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["6"],
    paddingVertical: spacing["10"],
  },
  pixPollingText: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  pixQrFallback: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["4"],
    paddingVertical: spacing["8"],
  },
  pixFallbackText: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: "center",
  },
  pixOrLabel: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: "center",
  },
  pixBrCodeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing["8"],
    fontSize: fontSizes.xs,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});

const stepperStyles = StyleSheet.create({
  list: {
    flexDirection: "column",
    gap: spacing["1"],
    marginTop: spacing["3"],
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing["2"],
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  dotDone: {
    backgroundColor: colors.primary,
  },
  dotCurrent: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  dotPending: {
    backgroundColor: "#E5E7EB",
  },
  dotConfirm: {
    backgroundColor: colors.primary,
  },
  label: {
    flex: 1,
    fontSize: fontSizes.sm,
    marginHorizontal: spacing["3"],
  },
  labelDone: {
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  labelCurrent: {
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  labelPending: {
    color: "#9CA3AF",
  },
});
