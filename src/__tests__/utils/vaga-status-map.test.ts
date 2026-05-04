import { formatVagaValue } from "@/utils/vaga-status-map";

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
