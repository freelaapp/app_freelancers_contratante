import { ValidationError } from "yup";
import { criarVagaSchema } from "@/validation/criar-vaga.schema";

const validData = {
  selectedServices: ["garcom"],
  dataEvento: "15/06/2025",
  horarioInicio: "18:00",
  horarioFim: "23:00",
  descricao: "Preciso de um garçom para evento de casamento com 100 pessoas.",
};

describe("criarVagaSchema", () => {
  it("deve retornar erro quando selectedServices está vazio", async () => {
    try {
      await criarVagaSchema.validate({ ...validData, selectedServices: [] }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Selecione ao menos um serviço");
    }
  });

  it("deve retornar erro quando dataEvento tem formato errado", async () => {
    try {
      await criarVagaSchema.validate({ ...validData, dataEvento: "01-01-2025" }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Use o formato DD/MM/AAAA");
    }
  });

  it("deve aceitar dataEvento com formato correto DD/MM/AAAA", async () => {
    await expect(
      criarVagaSchema.validate({ ...validData, dataEvento: "01/01/2025" }, { abortEarly: false })
    ).resolves.toBeDefined();
  });

  it("deve retornar erro quando descricao tem menos de 20 caracteres", async () => {
    try {
      await criarVagaSchema.validate({ ...validData, descricao: "Texto curto." }, { abortEarly: false });
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("A descrição deve ter no mínimo 20 caracteres");
    }
  });

  it("deve resolver sem erro quando todos os campos são válidos", async () => {
    await expect(
      criarVagaSchema.validate(validData, { abortEarly: false })
    ).resolves.toBeDefined();
  });

  it("deve retornar erro quando horarioFim é igual ao horarioInicio", async () => {
    try {
      await criarVagaSchema.validate(
        { ...validData, horarioInicio: "18:00", horarioFim: "18:00" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Horário de encerramento deve ser depois do início");
    }
  });

  it("deve retornar erro quando horarioFim é antes do horarioInicio", async () => {
    try {
      await criarVagaSchema.validate(
        { ...validData, horarioInicio: "18:00", horarioFim: "17:00" },
        { abortEarly: false }
      );
    } catch (err) {
      const error = err as ValidationError;
      expect(error.errors).toContain("Horário de encerramento deve ser depois do início");
    }
  });

  it("deve resolver sem erro quando horarioFim é depois do horarioInicio", async () => {
    await expect(
      criarVagaSchema.validate(
        { ...validData, horarioInicio: "18:00", horarioFim: "23:00" },
        { abortEarly: false }
      )
    ).resolves.toBeDefined();
  });
});
