import { FreelancerProfileSheet } from "@/components/freelancer-profile-sheet";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { VAGAS_DETALHE_MOCK, type Candidato, type VagaDetalhe } from "@/utils/vagas-mock";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
        <View style={styles.infoVerticalDivider} />
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

      <View style={styles.infoHDivider} />

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
      {showDivider && <View style={styles.rowDivider} />}
      <View style={styles.candidatoRow}>
        <View style={styles.candidatoAvatar}>
          <Text style={styles.candidatoIniciais}>{item.iniciais}</Text>
        </View>
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
            <View style={styles.badgeAceito}>
              <Text style={styles.badgeAceitoText}>aceito</Text>
            </View>
          )}
          {isRecusado && (
            <View style={styles.badgeRecusado}>
              <Text style={styles.badgeRecusadoText}>recusado</Text>
            </View>
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

const AVALIACOES_MOCK = [
  { estrelas: 5, data: "03/04", comentario: "Trabalho incrível!" },
  { estrelas: 4, data: "01/04", comentario: "Muito eficaz e comprometido" },
];

const VAGA_FALLBACK = VAGAS_DETALHE_MOCK["1"];

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

  const vagaBase: VagaDetalhe = VAGAS_DETALHE_MOCK[id ?? "1"] ?? VAGA_FALLBACK;
  const [stepAtual, setStepAtual] = useState(vagaBase.stepAtual);
  const [candidatos, setCandidatos] = useState<Candidato[]>(vagaBase.candidatos);

  const temCandidatoAceito = candidatos.some((c) => c.status === "aceito");
  const totalAceitos = candidatos.filter((c) => c.status === "aceito").length;
  const mostrarCandidatos = stepAtual <= 1;

  const [checkinCode, setCheckinCode] = useState<string | null>(null);
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);
  const [avaliarVisible, setAvaliarVisible] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [compareceu, setCompareceu] = useState<boolean | null>(null);

  const vaga = { ...vagaBase, stepAtual };
  const cta = getCtaConfig(stepAtual, temCandidatoAceito);

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

  function handleConfirmarCheckin() {
    setCheckinCode(null);
    setStepAtual(4);
  }

  function handleConfirmarCheckout() {
    setCheckoutCode(null);
    setStepAtual(5);
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
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing["8"] }]}>
        <TouchableOpacity style={styles.checkinBtn} activeOpacity={0.85} onPress={handleCta}>
          <Text style={styles.checkinBtnText}>{cta.label}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Check-in */}
      <Modal
        visible={checkinCode !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckinCode(null)}
        statusBarTranslucent
      >
        <Pressable style={styles.checkinBackdrop} onPress={() => setCheckinCode(null)}>
          <Pressable style={styles.checkinModal}>
            <TouchableOpacity style={styles.checkinClose} onPress={() => setCheckinCode(null)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.checkinModalText}>
              Mande o código de check-in para o freelancer
            </Text>
            <View style={styles.checkinCodeBox}>
              <Text style={styles.checkinCode}>
                {checkinCode?.split("").join("  ")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkinConfirmBtn}
              activeOpacity={0.85}
              onPress={handleConfirmarCheckin}
            >
              <Text style={styles.checkinConfirmBtnText}>Freelancer confirmou o código</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Avaliar */}
      <Modal
        visible={avaliarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvaliarVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.checkinBackdrop} onPress={() => setAvaliarVisible(false)}>
          <Pressable style={styles.avaliarModal}>
            <Text style={styles.avaliarTitle}>Faça uma avaliação</Text>

            {/* Estrelas */}
            <View style={styles.avaliarStars}>
              {Array.from({ length: 5 }, (_, i) => (
                <TouchableOpacity key={i} onPress={() => setEstrelas(i + 1)} hitSlop={6} activeOpacity={0.7}>
                  <Ionicons
                    name="star"
                    size={36}
                    color={i < estrelas ? colors.primary : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal Check-out */}
      <Modal
        visible={checkoutCode !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckoutCode(null)}
        statusBarTranslucent
      >
        <Pressable style={styles.checkinBackdrop} onPress={() => setCheckoutCode(null)}>
          <Pressable style={styles.checkinModal}>
            <TouchableOpacity style={styles.checkinClose} onPress={() => setCheckoutCode(null)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.checkinModalText}>
              Mande o código de check-out para o freelancer
            </Text>
            <View style={styles.checkinCodeBox}>
              <Text style={styles.checkinCode}>
                {checkoutCode?.split("").join("  ")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkinConfirmBtn}
              activeOpacity={0.85}
              onPress={handleConfirmarCheckout}
            >
              <Text style={styles.checkinConfirmBtnText}>Freelancer confirmou o código</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <FreelancerProfileSheet
        visible={selectedCandidato !== null}
        onClose={() => setSelectedCandidato(null)}
        nome={selectedCandidato?.nome ?? ""}
        iniciais={selectedCandidato?.iniciais ?? ""}
        avaliacoes={AVALIACOES_MOCK}
      />
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

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
    ...CARD_SHADOW,
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
  infoVerticalDivider: {
    width: 1,
    backgroundColor: colors.border,
    alignSelf: "stretch",
    marginHorizontal: spacing["4"],
  },
  infoHDivider: {
    height: 1,
    backgroundColor: colors.border,
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
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  candidatoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["5"],
    gap: spacing["6"],
  },
  candidatoAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  candidatoIniciais: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.white,
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
  badgeAceito: {
    backgroundColor: "#DCFCE7",
    borderRadius: radii.full,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["2"],
  },
  badgeAceitoText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#16A34A",
  },
  badgeRecusado: {
    backgroundColor: "#FEE2E2",
    borderRadius: radii.full,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["2"],
  },
  badgeRecusadoText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: "#DC2626",
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

  // Bottom
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["8"],
    backgroundColor: "#F0F0F0",
    zIndex: 2,
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

  // Modal check-in
  checkinBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing["8"],
  },
  checkinModal: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["12"],
    width: "100%",
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
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    padding: spacing["12"],
    width: "100%",
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
