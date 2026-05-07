import { setPendingVaga, consumePendingVaga } from "@/utils/pending-vaga-store";
import type { VagaApi } from "@/types/vagas";

const VAGA_FIXTURE: VagaApi = {
  id: "vaga-uuid",
  title: "Garçom para evento",
  status: "OPEN",
};

beforeEach(() => {
  consumePendingVaga();
});

describe("pending-vaga-store", () => {
  describe("consumePendingVaga", () => {
    it("retorna null quando nenhuma vaga está pendente", () => {
      expect(consumePendingVaga()).toBeNull();
    });

    it("retorna null em chamadas subsequentes após consumir", () => {
      setPendingVaga(VAGA_FIXTURE);
      consumePendingVaga();

      expect(consumePendingVaga()).toBeNull();
    });
  });

  describe("setPendingVaga + consumePendingVaga", () => {
    it("retorna a vaga definida por setPendingVaga", () => {
      setPendingVaga(VAGA_FIXTURE);

      expect(consumePendingVaga()).toEqual(VAGA_FIXTURE);
    });

    it("consome a vaga apenas uma vez (semântica de fila de tamanho 1)", () => {
      setPendingVaga(VAGA_FIXTURE);

      const first = consumePendingVaga();
      const second = consumePendingVaga();

      expect(first).toEqual(VAGA_FIXTURE);
      expect(second).toBeNull();
    });

    it("substitui vaga anterior quando setPendingVaga é chamado duas vezes", () => {
      const outraVaga: VagaApi = { ...VAGA_FIXTURE, id: "vaga-nova", title: "Barman" };

      setPendingVaga(VAGA_FIXTURE);
      setPendingVaga(outraVaga);

      expect(consumePendingVaga()).toEqual(outraVaga);
    });

    it("preserva todos os campos da VagaApi", () => {
      const vagaCompleta: VagaApi = {
        id: "vaga-completa",
        title: "Eletricista",
        description: "Instalação elétrica",
        location: "São Paulo, SP",
        date: "2026-06-01T00:00:00.000Z",
        startTime: "2026-06-01T08:00:00.000Z",
        endTime: "2026-06-01T17:00:00.000Z",
        status: "OPEN",
        value: 350,
      };

      setPendingVaga(vagaCompleta);

      expect(consumePendingVaga()).toEqual(vagaCompleta);
    });
  });
});
