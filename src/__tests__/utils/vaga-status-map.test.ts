import {
  formatVagaValue,
  formatVagaValueFromCents,
  mapApiStatus,
  mapApiStatusExtended,
  mapApiStatusToStep,
  resolveApiMoneyToReais,
} from "@/utils/vaga-status-map";

describe("formatVagaValue", () => {
  it("formata valor inteiro sem decimais", () => {
    expect(formatVagaValue(250)).toBe("R$ 250,00");
  });

  it("formata valor com separador de milhar e decimais", () => {
    expect(formatVagaValue(1234567.89)).toBe("R$ 1.234.567,89");
  });

  it("formata zero", () => {
    expect(formatVagaValue(0)).toBe("R$ 0,00");
  });

  it("retorna string vazia para undefined", () => {
    expect(formatVagaValue(undefined)).toBe("");
  });

  it("retorna string vazia para null coercionado como undefined", () => {
    expect(formatVagaValue(null as unknown as undefined)).toBe("");
  });
});

describe("formatVagaValueFromCents", () => {
  it("formata centavos corretamente", () => {
    expect(formatVagaValueFromCents(20185)).toBe("R$ 201,85");
  });
});

describe("resolveApiMoneyToReais", () => {
  it("usa campos em centavos quando presentes", () => {
    expect(resolveApiMoneyToReais({ payment: 15000 })).toBe(150);
  });

  it("aceita value em reais", () => {
    expect(resolveApiMoneyToReais({ value: 250.5 })).toBe(250.5);
  });

  it("normaliza value inteiro grande como centavos", () => {
    expect(resolveApiMoneyToReais({ value: 20185 })).toBe(201.85);
  });
});

/**
 * mapApiStatus — cobre apenas os status reais do campo vacancy.status.
 *
 * A API retorna OPEN para vagas publicadas (inclui vagas com candidatos,
 * vagas com candidato aceito e job em andamento) e CLOSED após o check-out.
 * Status de job (accepted, scheduled, in_progress etc.) não aparecem em
 * vacancy.status e portanto devem cair no fallback "aberta".
 */
describe("mapApiStatus", () => {
  describe("status → aberta", () => {
    it.each(["open", "OPEN"])("%s → aberta", (s) =>
      expect(mapApiStatus(s)).toBe("aberta")
    );

    it("status desconhecido cai no fallback aberta", () => {
      expect(mapApiStatus("unknown_xyz")).toBe("aberta");
    });

    it("string vazia cai no fallback aberta", () => {
      expect(mapApiStatus("")).toBe("aberta");
    });

    it("status de job não aparece em vacancy.status — fallback aberta", () => {
      const jobStatuses = [
        "pending", "waiting", "accepted", "confirmed", "scheduled",
        "payment_pending", "active", "in_progress", "started",
        "checking_in", "checking_out", "transfer_pending",
        "finished", "completed", "done",
      ];
      jobStatuses.forEach((s) => {
        expect(mapApiStatus(s)).toBe("aberta");
      });
    });
  });

  describe("status → concluida", () => {
    it.each(["closed", "CLOSED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );

    it.each(["cancelled", "CANCELLED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );

    it.each(["cancelled_by_contractor", "CANCELLED_BY_CONTRACTOR"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
  });
});

/**
 * mapApiStatusExtended — deriva status de UI a partir de vacancy.status
 * e campos auxiliares opcionais (jobStatus, hasAcceptedCandidacy).
 *
 * Regras testadas:
 * 1. CLOSED/CANCELLED* → "concluida" independente de campos auxiliares
 * 2. jobStatus IN_PROGRESS → "em_andamento"
 * 3. jobStatus SCHEDULED → "preenchida"
 * 4. hasAcceptedCandidacy = true (sem jobStatus) → "preenchida"
 * 5. OPEN sem auxiliares → "aberta" (fallback)
 */
describe("mapApiStatusExtended", () => {
  describe("vacancy.status encerrada → sempre concluida", () => {
    it.each(["closed", "CLOSED"])("%s → concluida", (s) =>
      expect(mapApiStatusExtended(s)).toBe("concluida")
    );

    it.each(["cancelled", "CANCELLED"])("%s → concluida", (s) =>
      expect(mapApiStatusExtended(s)).toBe("concluida")
    );

    it.each(["cancelled_by_contractor", "CANCELLED_BY_CONTRACTOR"])("%s → concluida", (s) =>
      expect(mapApiStatusExtended(s)).toBe("concluida")
    );

    it("CLOSED com jobStatus in_progress → concluida (vacancy status tem precedência)", () => {
      expect(mapApiStatusExtended("CLOSED", { jobStatus: "in_progress" })).toBe("concluida");
    });
  });

  describe("OPEN com jobStatus em andamento → em_andamento", () => {
    it.each(["in_progress", "started", "checking_in", "checking_out", "transfer_pending"])(
      "jobStatus %s → em_andamento",
      (jobStatus) =>
        expect(mapApiStatusExtended("OPEN", { jobStatus })).toBe("em_andamento")
    );
  });

  describe("OPEN com jobStatus agendado → preenchida", () => {
    it.each(["scheduled", "confirmed", "payment_completed", "active"])(
      "jobStatus %s → preenchida",
      (jobStatus) =>
        expect(mapApiStatusExtended("OPEN", { jobStatus })).toBe("preenchida")
    );
  });

  describe("OPEN sem jobStatus mas com candidatura aceita → preenchida", () => {
    it("hasAcceptedCandidacy true → preenchida", () => {
      expect(mapApiStatusExtended("OPEN", { hasAcceptedCandidacy: true })).toBe("preenchida");
    });

    it("hasAcceptedCandidacy false → aberta", () => {
      expect(mapApiStatusExtended("OPEN", { hasAcceptedCandidacy: false })).toBe("aberta");
    });
  });

  describe("OPEN sem auxiliares → aberta", () => {
    it("sem opções → aberta", () =>
      expect(mapApiStatusExtended("OPEN")).toBe("aberta")
    );

    it("string vazia → aberta", () =>
      expect(mapApiStatusExtended("")).toBe("aberta")
    );

    it("status desconhecido → aberta", () =>
      expect(mapApiStatusExtended("unknown_xyz")).toBe("aberta")
    );
  });

  describe("jobStatus desconhecido não altera o fallback", () => {
    it("jobStatus irreconhecível com OPEN → aberta", () => {
      expect(mapApiStatusExtended("OPEN", { jobStatus: "some_unknown_status" })).toBe("aberta");
    });
  });
});

describe("mapApiStatusToStep", () => {
  it("open → 1", () => expect(mapApiStatusToStep("open")).toBe(1));
  it("OPEN (maiúsculo) → 1", () => expect(mapApiStatusToStep("OPEN")).toBe(1));
  it("closed → 6", () => expect(mapApiStatusToStep("closed")).toBe(6));
  it("CLOSED (maiúsculo) → 6", () => expect(mapApiStatusToStep("CLOSED")).toBe(6));
  it("cancelled → 0", () => expect(mapApiStatusToStep("cancelled")).toBe(0));
  it("cancelled_by_contractor → 0", () => expect(mapApiStatusToStep("cancelled_by_contractor")).toBe(0));
  it("status desconhecido → 0", () => expect(mapApiStatusToStep("unknown_xyz")).toBe(0));
  it("string vazia → 0", () => expect(mapApiStatusToStep("")).toBe(0));
});
