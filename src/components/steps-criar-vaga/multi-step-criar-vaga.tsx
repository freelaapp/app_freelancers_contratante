import { BottomActionBar } from "@/components/bottom-action-bar";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { colors, fontSizes, fontWeights, spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useVagaForm } from "@/hooks/useVagaForm";
import { goBackOrReplace } from "@/utils/navigation";
import { getTarifa, ModuloTarifas } from "@/utils/tarifas";
import { SERVICES } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

import { Step1DataEvento } from "./step1-data-evento";
import { Step2TipoServico } from "./step2-tipo-servico";
import { Step3Horarios } from "./step3-horarios";
import { Step4Overview } from "./step4-overview";

const STEP_TITLES = [
  "Data do evento",
  "Tipo de serviço",
  "Horário",
  "Revisão",
];

export function MultiStepCriarVaga() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const modulo = user?.module as ModuloTarifas | null;

  const {
    step,
    formData,
    updateField,
    nextStep,
    prevStep,
    reset,
    canProceed,
    isFirstStep,
    isLastStep,
  } = useVagaForm();

  const [showSuccess, setShowSuccess] = useState(false);

  const selectedServiceId = formData.selectedServices[0];
  const tarifa = selectedServiceId && modulo ? getTarifa(modulo, selectedServiceId) : null;

  const handleNext = () => {
    if (canProceed()) {
      nextStep();
    }
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      reset();
      goBackOrReplace(router, "/(home)");
    }, 1500);
  };

  const toggleService = (id: string) => {
    const current = formData.selectedServices;
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [id];
    updateField("selectedServices", next);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1DataEvento
            value={formData.dataEvento}
            onChange={(value) => updateField("dataEvento", value)}
          />
        );
      case 2:
        return (
          <Step2TipoServico
            selectedServices={formData.selectedServices}
            onToggle={toggleService}
            modulo={modulo}
          />
        );
      case 3: {
        const service = SERVICES.find((s) => s.id === selectedServiceId);
        return (
          <Step3Horarios
            dataEvento={formData.dataEvento}
            horarioInicio={formData.horarioInicio}
            horarioFim={formData.horarioFim}
            onHorarioInicioChange={(value) => updateField("horarioInicio", value)}
            onHorarioFimChange={(value) => updateField("horarioFim", value)}
            jornadaMinima={tarifa?.jornadaMinima}
            horaInicioServico={service?.horaInicio ?? 0}
            horaFimServico={service?.horaFim ?? 23}
          />
        );
      }
      case 4:
        return (
          <Step4Overview
            dataEvento={formData.dataEvento}
            selectedServices={formData.selectedServices}
            horarioInicio={formData.horarioInicio}
            horarioFim={formData.horarioFim}
            noEstabelecimento={formData.noEstabelecimento}
            endereco={formData.endereco}
            descricao={formData.descricao}
            onNoEstabelecimentoChange={(value) =>
              updateField("noEstabelecimento", value)
            }
            onEnderecoChange={(value) => updateField("endereco", value)}
            onDescricaoChange={(value) => updateField("descricao", value)}
            onSuccess={handleSuccess}
            modulo={modulo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <PageHeader
        badge="Freela para Empresas"
        title="Nova contratação"
        subtitle="Monte seu evento step by step"
        rounded
      />

      <View style={styles.stepIndicator}>
        <View style={styles.stepCirclesRow}>
          {STEP_TITLES.map((_, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <View key={index} style={styles.stepCircleWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    isActive && styles.stepCircleActive,
                    isCompleted && styles.stepCircleCompleted,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        (isActive || isCompleted) && styles.stepNumberActive,
                      ]}
                    >
                      {stepNum}
                    </Text>
                  )}
                </View>
                {index < STEP_TITLES.length - 1 && (
                  <View
                    style={[
                      styles.stepTrack,
                      isCompleted && styles.stepTrackCompleted,
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.stepLabelsRow}>
          {STEP_TITLES.map((title, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <Text
                key={index}
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            );
          })}
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` as `${number}%` }]} />
      </View>

      <View style={styles.content}>{renderStepContent()}</View>

      {!isLastStep && (
        <BottomActionBar backgroundColor={colors.white} showTopBorder>
          <View style={styles.buttonRow}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={prevStep}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={colors.ink}
                />
              </TouchableOpacity>
            )}
            <View style={styles.nextButtonContainer}>
              <PrimaryButton
                label={step === 3 ? "Revisar detalhes →" : "Próximo →"}
                onPress={handleNext}
                disabled={!canProceed()}
              />
            </View>
          </View>
        </BottomActionBar>
      )}

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color={colors.primary} />
          </View>
          <View style={styles.successTextContainer}>
            <Text style={styles.successText}>Vaga publicada!</Text>
            <Text style={styles.successSubtext}>Você será redirecionado em instantes</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  stepIndicator: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing["10"],
    paddingTop: spacing["6"],
    paddingBottom: spacing["4"],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepCirclesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircleWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepTrack: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
    borderRadius: 1,
  },
  stepTrackCompleted: {
    backgroundColor: colors.primary,
  },
  stepLabelsRow: {
    flexDirection: "row",
    marginTop: spacing["2"],
  },
  stepNumber: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.muted,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepLabel: {
    flex: 1,
    fontSize: fontSizes.xs,
    color: colors.muted,
    textAlign: "center",
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  stepLabelCompleted: {
    color: colors.primary,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: colors.borderLight,
  },
  progressBarFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonContainer: {
    flex: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    zIndex: 100,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  successTextContainer: {
    alignItems: "center",
    gap: 8,
  },
  successText: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  successSubtext: {
    fontSize: fontSizes.base,
    color: "rgba(255,255,255,0.7)",
  },
});