export type VagaStatus = "confirmado" | "aguardando" | "finalizado";

export type Vaga = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  value: string;
  status: VagaStatus;
};

export const VAGAS_MOCK: Vaga[] = [
  {
    id: "1",
    title: "Garçom - Evento Corporativo",
    location: "Buffet Elegance",
    date: "15 Fev 2026",
    time: "18:00 - 00:00",
    value: "R$250",
    status: "finalizado",
  },
  {
    id: "2",
    title: "Bartender - Festa Premium",
    location: "Espaço Nobre",
    date: "22 Fev 2026",
    time: "20:00 - 03:00",
    value: "R$300",
    status: "confirmado",
  },
  {
    id: "3",
    title: "Garçom - Casamento",
    location: "Villa Real",
    date: "24 Fev 2026",
    time: "16:00 - 23:00",
    value: "R$280",
    status: "aguardando",
  },
  {
    id: "4",
    title: "Cozinheiro - Brunch",
    location: "Hotel Park",
    date: "10 Fev 2026",
    time: "08:00 - 14:00",
    value: "R$350",
    status: "finalizado",
  },
];
