import { VAGA_FILTERS, VagaFilter } from "@/utils/vaga-filters";

describe("VAGA_FILTERS", () => {
  it("deve ser um array não vazio", () => {
    expect(Array.isArray(VAGA_FILTERS)).toBe(true);
    expect(VAGA_FILTERS.length).toBeGreaterThan(0);
  });

  it("deve conter o filtro todos como primeiro item", () => {
    expect(VAGA_FILTERS[0].id).toBe("todos");
  });

  it("deve conter os filtros confirmados, aguardando e finalizados", () => {
    const ids = VAGA_FILTERS.map((f) => f.id);
    expect(ids).toContain("confirmados");
    expect(ids).toContain("aguardando");
    expect(ids).toContain("finalizados");
  });

  it("deve ter exatamente 4 filtros", () => {
    expect(VAGA_FILTERS).toHaveLength(4);
  });

  it("cada filtro deve ter id e label definidos como strings não vazias", () => {
    VAGA_FILTERS.forEach((filter: VagaFilter) => {
      expect(typeof filter.id).toBe("string");
      expect(filter.id.length).toBeGreaterThan(0);
      expect(typeof filter.label).toBe("string");
      expect(filter.label.length).toBeGreaterThan(0);
    });
  });

  it("os ids dos filtros devem ser únicos", () => {
    const ids = VAGA_FILTERS.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("deve ter o label correto para cada filtro", () => {
    const todosFilter = VAGA_FILTERS.find((f) => f.id === "todos");
    const confirmadosFilter = VAGA_FILTERS.find((f) => f.id === "confirmados");
    const aguardandoFilter = VAGA_FILTERS.find((f) => f.id === "aguardando");
    const finalizadosFilter = VAGA_FILTERS.find((f) => f.id === "finalizados");

    expect(todosFilter?.label).toBe("Todos");
    expect(confirmadosFilter?.label).toBe("Confirmados");
    expect(aguardandoFilter?.label).toBe("Aguardando");
    expect(finalizadosFilter?.label).toBe("Finalizados");
  });
});
