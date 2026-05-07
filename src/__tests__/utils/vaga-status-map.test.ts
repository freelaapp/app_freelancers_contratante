import {
  formatVagaValue,
  formatVagaValueFromCents,
  mapApiStatus,
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

describe("mapApiStatus", () => {
  describe("status → preenchida", () => {
    it.each(["confirmed", "CONFIRMED"])("%s → preenchida", (s) =>
      expect(mapApiStatus(s)).toBe("preenchida")
    );
    it.each(["accepted", "ACCEPTED"])("%s → preenchida", (s) =>
      expect(mapApiStatus(s)).toBe("preenchida")
    );
    it.each(["scheduled", "SCHEDULED", "payment_pending", "PAYMENT_PENDING"])("%s → preenchida", (s) =>
      expect(mapApiStatus(s)).toBe("preenchida")
    );
  });

  describe("status → aberta", () => {
    it.each(["open", "OPEN"])("%s → aberta", (s) =>
      expect(mapApiStatus(s)).toBe("aberta")
    );
    it.each(["pending", "PENDING"])("%s → aberta", (s) =>
      expect(mapApiStatus(s)).toBe("aberta")
    );
    it.each(["waiting", "WAITING"])("%s → aberta", (s) =>
      expect(mapApiStatus(s)).toBe("aberta")
    );
  });

  describe("status → em_andamento", () => {
    it.each(["active", "ACTIVE", "in_progress", "IN_PROGRESS", "started", "STARTED", "checking_in", "CHECKING_IN", "checking_out", "CHECKING_OUT", "transfer_pending", "TRANSFER_PENDING"])("%s → em_andamento", (s) =>
      expect(mapApiStatus(s)).toBe("em_andamento")
    );
  });

  describe("status → concluida", () => {
    it.each(["closed", "CLOSED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
    it.each(["finished", "FINISHED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
    it.each(["completed", "COMPLETED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
    it.each(["done", "DONE"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
    it.each(["cancelled", "CANCELLED"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
    it.each(["cancelled_by_contractor", "CANCELLED_BY_CONTRACTOR"])("%s → concluida", (s) =>
      expect(mapApiStatus(s)).toBe("concluida")
    );
  });

  it("status desconhecido cai no fallback aberta", () => {
    expect(mapApiStatus("unknown_xyz")).toBe("aberta");
  });

  it("string vazia cai no fallback aberta", () => {
    expect(mapApiStatus("")).toBe("aberta");
  });
});

describe("mapApiStatusToStep", () => {
  it("open → 1", () => expect(mapApiStatusToStep("open")).toBe(1));
  it("pending → 1", () => expect(mapApiStatusToStep("pending")).toBe(1));
  it("accepted → 1", () => expect(mapApiStatusToStep("accepted")).toBe(1));
  it("closed → 2", () => expect(mapApiStatusToStep("closed")).toBe(2));
  it("CLOSED (maiúsculo) → 2", () => expect(mapApiStatusToStep("CLOSED")).toBe(2));
  it("payment_pending → 2", () => expect(mapApiStatusToStep("payment_pending")).toBe(2));
  it("active → 3", () => expect(mapApiStatusToStep("active")).toBe(3));
  it("confirmed → 3", () => expect(mapApiStatusToStep("confirmed")).toBe(3));
  it("in_progress → 3", () => expect(mapApiStatusToStep("in_progress")).toBe(3));
  it("started → 3", () => expect(mapApiStatusToStep("started")).toBe(3));
  it("checking_in → 3", () => expect(mapApiStatusToStep("checking_in")).toBe(3));
  it("checking_out → 4", () => expect(mapApiStatusToStep("checking_out")).toBe(4));
  it("transfer_pending → 5", () => expect(mapApiStatusToStep("transfer_pending")).toBe(5));
  it("finished → 6", () => expect(mapApiStatusToStep("finished")).toBe(6));
  it("completed → 6", () => expect(mapApiStatusToStep("completed")).toBe(6));
  it("status desconhecido → 0", () => expect(mapApiStatusToStep("unknown_xyz")).toBe(0));
  it("string vazia → 0", () => expect(mapApiStatusToStep("")).toBe(0));
});
