import { useCallback, useState } from "react";

export type VagaFormData = {
  dataEvento: string;
  selectedServices: string[];
  horarioInicio: string;
  horarioFim: string;
  noEstabelecimento: boolean;
  endereco: string;
  descricao: string;
};

const initialData: VagaFormData = {
  dataEvento: "",
  selectedServices: [],
  horarioInicio: "",
  horarioFim: "",
  noEstabelecimento: true,
  endereco: "",
  descricao: "",
};

export type Step = 1 | 2 | 3 | 4;

export function useVagaForm() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<VagaFormData>(initialData);

  const updateField = useCallback(<K extends keyof VagaFormData>(
    field: K,
    value: VagaFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4) as Step);
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  }, []);

  const goToStep = useCallback((s: Step) => {
    setStep(s);
  }, []);

  const reset = useCallback(() => {
    setFormData(initialData);
    setStep(1);
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return formData.dataEvento.length > 0;
      case 2:
        return formData.selectedServices.length > 0;
      case 3:
        return formData.horarioInicio.length > 0 && formData.horarioFim.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, formData]);

  return {
    step,
    formData,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    reset,
    canProceed,
    isFirstStep: step === 1,
    isLastStep: step === 4,
  };
}