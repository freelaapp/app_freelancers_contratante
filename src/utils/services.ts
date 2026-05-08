export type Service = {
  id: string;
  emoji: string;
  label: string;
  horaInicio: number;
  horaFim: number;
};

export const SERVICES: Service[] = [
  { id: "1",  emoji: "🍹", label: "Barista",                horaInicio: 8,  horaFim: 23 },
  { id: "2",  emoji: "🍸", label: "Barman/Bartender",       horaInicio: 12, horaFim: 23 },
  { id: "3",  emoji: "👨‍🍳", label: "Cozinheiro(a)",          horaInicio: 8,  horaFim: 23 },
  { id: "4",  emoji: "🍽️", label: "Garçom/Garçonete",       horaInicio: 10, horaFim: 23 },
  { id: "5",  emoji: "🧹", label: "Auxiliar de limpeza",    horaInicio: 6,  horaFim: 22 },
  { id: "6",  emoji: "🥘", label: "Auxiliar de cozinha",    horaInicio: 8,  horaFim: 23 },
  { id: "7",  emoji: "🛎️", label: "Camareira",              horaInicio: 6,  horaFim: 20 },
  { id: "8",  emoji: "🍳", label: "Chapeiro(a)",            horaInicio: 8,  horaFim: 23 },
  { id: "9",  emoji: "🍴", label: "Cumim",                  horaInicio: 10, horaFim: 23 },
  { id: "10", emoji: "🔥", label: "Churrasqueiro",          horaInicio: 10, horaFim: 23 },
  { id: "11", emoji: "🛡️", label: "Segurança (Não Armado)", horaInicio: 0,  horaFim: 23 },
  { id: "12", emoji: "💁", label: "Hostess/Recepcionista",  horaInicio: 8,  horaFim: 23 },
  { id: "13", emoji: "🚗", label: "Manobrista",             horaInicio: 10, horaFim: 23 },
  { id: "14", emoji: "🎧", label: "DJ",                     horaInicio: 14, horaFim: 23 },
  { id: "15", emoji: "🎸", label: "Músico (Sertanejo)",     horaInicio: 14, horaFim: 23 },
  { id: "16", emoji: "🎵", label: "Músico (Rock)",          horaInicio: 14, horaFim: 23 },
  { id: "17", emoji: "🥁", label: "Músico (Samba e Pagode)", horaInicio: 14, horaFim: 23 },
  { id: "18", emoji: "🎷", label: "Músico (MPB)",           horaInicio: 14, horaFim: 23 },
  { id: "19", emoji: "🎼", label: "Músico (Multi Estilo)",  horaInicio: 14, horaFim: 23 },
];
