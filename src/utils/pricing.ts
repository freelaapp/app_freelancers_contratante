type ServicePricing = {
  hourlyRateInCents: number;
  minimumJourneyHours: number;
};

const REFERENCE_SERVICE_ID_FOR_HOURLY_COPY = "garcom" as const;

function formatHourlyRateLabel(hourlyRateInCents: number): string {
  const reais = hourlyRateInCents / 100;
  const cents = Math.round(reais * 100) % 100;
  const intPart = Math.floor(reais).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = cents === 0 ? `R$ ${intPart}` : `R$ ${intPart},${String(cents).padStart(2, "0")}`;
  return `${formatted}/h`;
}

export function formatModuleReferenceHourlyLabel(moduleType: "empresa" | "casa"): string {
  const row = PRICING_TABLE[moduleType]?.[REFERENCE_SERVICE_ID_FOR_HOURLY_COPY];
  if (!row) return moduleType === "empresa" ? "R$ 25/h" : "R$ 50/h";
  return formatHourlyRateLabel(row.hourlyRateInCents);
}

export const PRICING_TABLE: Record<"empresa" | "casa", Record<string, ServicePricing>> = {
  empresa: {
    barista: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    barman: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    cozinheiro: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    garcom: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    chapeiro: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    churrasqueiro: { hourlyRateInCents: 2500, minimumJourneyHours: 6 },
    "auxiliar-limpeza": { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    "auxiliar-cozinha": { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    camareira: { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    cumim: { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    seguranca: { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    hostess: { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    manobrista: { hourlyRateInCents: 2000, minimumJourneyHours: 6 },
    dj: { hourlyRateInCents: 11667, minimumJourneyHours: 3 },
    "musico-sertanejo": { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
    "musico-rock": { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
    "musico-samba": { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
    "musico-mpb": { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
    "musico-multi": { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
  },
  casa: {
    barista: { hourlyRateInCents: 5000, minimumJourneyHours: 4 },
    barman: { hourlyRateInCents: 5000, minimumJourneyHours: 4 },
    garcom: { hourlyRateInCents: 5000, minimumJourneyHours: 4 },
    cozinheiro: { hourlyRateInCents: 7500, minimumJourneyHours: 4 },
    churrasqueiro: { hourlyRateInCents: 7500, minimumJourneyHours: 4 },
    "auxiliar-limpeza": { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    "auxiliar-cozinha": { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    camareira: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    chapeiro: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    cumim: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    seguranca: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    hostess: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    manobrista: { hourlyRateInCents: 4000, minimumJourneyHours: 4 },
    dj: { hourlyRateInCents: 15000, minimumJourneyHours: 3 },
    "musico-sertanejo": { hourlyRateInCents: 17000, minimumJourneyHours: 3 },
    "musico-rock": { hourlyRateInCents: 17000, minimumJourneyHours: 3 },
    "musico-samba": { hourlyRateInCents: 17000, minimumJourneyHours: 3 },
    "musico-mpb": { hourlyRateInCents: 17000, minimumJourneyHours: 3 },
    "musico-multi": { hourlyRateInCents: 17000, minimumJourneyHours: 3 },
  },
};

export function calculateServicePrice(
  serviceId: string,
  moduleType: "empresa" | "casa",
  hours: number,
): { totalPerPersonInCents: number } | null {
  if (hours <= 0) return null;
  const pricing = PRICING_TABLE[moduleType]?.[serviceId];
  if (!pricing) return null;
  return { totalPerPersonInCents: pricing.hourlyRateInCents * hours };
}

export function getMinimumJourneyHoursForService(
  serviceId: string,
  moduleType: "empresa" | "casa" | null,
): number {
  if (moduleType) {
    const row = PRICING_TABLE[moduleType][serviceId];
    if (row) return row.minimumJourneyHours;
  }
  const casa = PRICING_TABLE.casa[serviceId];
  const empresa = PRICING_TABLE.empresa[serviceId];
  return casa?.minimumJourneyHours ?? empresa?.minimumJourneyHours ?? 4;
}
