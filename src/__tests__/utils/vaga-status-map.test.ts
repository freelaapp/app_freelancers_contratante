import { formatVagaValue, mapApiStatusToStep } from "@/utils/vaga-status-map";

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
