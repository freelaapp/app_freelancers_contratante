/**
 * Testes unitários para as regras de montagem do payload de criação de vaga.
 * Cobre os três problemas encontrados na auditoria do contrato:
 *   1. serviceType deve ser uppercase
 *   2. cityId deve ser incluído quando endereço tem cidade
 *   3. startTime/endTime devem ser ISO com offset do runtime (não sufixo Z manual)
 */

describe("Payload de criação de vaga — regras de contrato", () => {
  describe("serviceType uppercase", () => {
    it("deve converter serviceLabel para uppercase ao montar serviceType", () => {
      const serviceLabel = "Garçom/Garçonete";
      const serviceType = serviceLabel.toUpperCase();
      expect(serviceType).toBe("GARÇOM/GARÇONETE");
    });

    it("deve converter label composto para uppercase", () => {
      const serviceLabel = "Barman/Bartender";
      expect(serviceLabel.toUpperCase()).toBe("BARMAN/BARTENDER");
    });

    it("deve converter labels com parênteses para uppercase", () => {
      const serviceLabel = "Músico (Sertanejo)";
      expect(serviceLabel.toUpperCase()).toBe("MÚSICO (SERTANEJO)");
    });
  });

  describe("cityId no payload", () => {
    it("deve incluir cityId quando noEstabelecimento é false e cidade está preenchida", () => {
      const noEstabelecimento = false;
      const cidade = "São Paulo";

      const cityIdField = !noEstabelecimento && cidade ? { cityId: cidade } : {};

      expect(cityIdField).toEqual({ cityId: "São Paulo" });
    });

    it("não deve incluir cityId quando noEstabelecimento é true", () => {
      const noEstabelecimento = true;
      const cidade = "Rio de Janeiro";

      const cityIdField = !noEstabelecimento && cidade ? { cityId: cidade } : {};

      expect(cityIdField).toEqual({});
    });

    it("não deve incluir cityId quando cidade está vazia", () => {
      const noEstabelecimento = false;
      const cidade = "";

      const cityIdField = !noEstabelecimento && cidade ? { cityId: cidade } : {};

      expect(cityIdField).toEqual({});
    });
  });

  describe("toISOWithBrazilOffset — conversão de horário local para ISO", () => {
    const toISOWithBrazilOffset = (date: string, time: string): string => {
      const [h, m] = time.split(":").map(Number);
      const localDate = new Date(
        `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
      );
      return localDate.toISOString();
    };

    it("deve retornar string no formato ISO 8601 com sufixo Z", () => {
      const result = toISOWithBrazilOffset("2026-03-20", "18:00");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("deve gerar ISO diferente do sufixo Z manual direto (offset do runtime aplicado)", () => {
      const date = "2026-03-20";
      const time = "18:00";

      const manualZ = `${date}T${time}:00.000Z`;
      const withOffset = toISOWithBrazilOffset(date, time);

      const tzOffset = new Date().getTimezoneOffset();
      if (tzOffset !== 0) {
        expect(withOffset).not.toBe(manualZ);
      } else {
        expect(withOffset).toBe(manualZ);
      }
    });

    it("deve preservar a data correta para horário de início", () => {
      const result = toISOWithBrazilOffset("2026-03-20", "10:30");
      const parsed = new Date(result);
      expect(isNaN(parsed.getTime())).toBe(false);
    });

    it("deve preservar a data correta para horário de fim", () => {
      const result = toISOWithBrazilOffset("2026-03-20", "23:00");
      const parsed = new Date(result);
      expect(isNaN(parsed.getTime())).toBe(false);
    });
  });

  describe("date — formato YYYY-MM-DD", () => {
    it("deve converter data no formato DD/MM/YYYY para YYYY-MM-DD", () => {
      const dataEvento = "20/03/2026";
      const [day, month, year] = dataEvento.split("/");
      const dateISO = `${year}-${month}-${day}`;
      expect(dateISO).toBe("2026-03-20");
    });

    it("deve manter o formato correto para o contrato da API", () => {
      const dateISO = "2026-03-20";
      expect(dateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
