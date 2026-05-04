export type Tarifa = {
  serviceId: string;
  label: string;
  valorHora: number;
  jornadaMinima: number;
  valorTotal: number;
  taxaRetencao: number;
  freelancerRecebe: number;
};

export type ModuloTarifas = "bars-restaurants" | "home-services";

export const TARIFAS: Record<ModuloTarifas, Tarifa[]> = {
  "bars-restaurants": [
    { serviceId: "1",  label: "Barista",                  valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "2",  label: "Barman/Bartender",          valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "3",  label: "Cozinheiro(a)",             valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "4",  label: "Garçom/Garçonete",          valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "5",  label: "Auxiliar de Limpeza",       valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "6",  label: "Auxiliar de Cozinha",       valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "7",  label: "Camareira",                 valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "8",  label: "Chapeiro(a)",               valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "9",  label: "Cumim",                     valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "10", label: "Churrasqueiro",             valorHora: 25,     jornadaMinima: 6, valorTotal: 150, taxaRetencao: 30, freelancerRecebe: 120 },
    { serviceId: "11", label: "Segurança (Não Armado)",    valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "12", label: "Hostess/Recepcionista",     valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "13", label: "Manobrista",                valorHora: 20,     jornadaMinima: 6, valorTotal: 120, taxaRetencao: 24, freelancerRecebe: 96  },
    { serviceId: "14", label: "DJ",                        valorHora: 116.67, jornadaMinima: 3, valorTotal: 350, taxaRetencao: 70, freelancerRecebe: 280 },
    { serviceId: "15", label: "Músico (Sertanejo)",        valorHora: 150,    jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90, freelancerRecebe: 360 },
    { serviceId: "16", label: "Músico (Rock)",             valorHora: 150,    jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90, freelancerRecebe: 360 },
    { serviceId: "17", label: "Músico (Samba/Pagode)",     valorHora: 150,    jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90, freelancerRecebe: 360 },
    { serviceId: "18", label: "Músico (MPB)",              valorHora: 150,    jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90, freelancerRecebe: 360 },
    { serviceId: "19", label: "Músico (Multi Estilo)",     valorHora: 150,    jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90, freelancerRecebe: 360 },
  ],
  "home-services": [
    { serviceId: "1",  label: "Barista",                  valorHora: 50,  jornadaMinima: 4, valorTotal: 200, taxaRetencao: 40,  freelancerRecebe: 160 },
    { serviceId: "2",  label: "Barman/Bartender",          valorHora: 50,  jornadaMinima: 4, valorTotal: 200, taxaRetencao: 40,  freelancerRecebe: 160 },
    { serviceId: "3",  label: "Cozinheiro(a)",             valorHora: 75,  jornadaMinima: 4, valorTotal: 300, taxaRetencao: 60,  freelancerRecebe: 240 },
    { serviceId: "4",  label: "Garçom/Garçonete",          valorHora: 50,  jornadaMinima: 4, valorTotal: 200, taxaRetencao: 40,  freelancerRecebe: 160 },
    { serviceId: "5",  label: "Auxiliar de Limpeza",       valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "6",  label: "Auxiliar de Cozinha",       valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "7",  label: "Camareira",                 valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "8",  label: "Chapeiro(a)",               valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "9",  label: "Cumim",                     valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "10", label: "Churrasqueiro",             valorHora: 75,  jornadaMinima: 4, valorTotal: 300, taxaRetencao: 60,  freelancerRecebe: 240 },
    { serviceId: "11", label: "Segurança (Não Armado)",    valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "12", label: "Hostess/Recepcionista",     valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "13", label: "Manobrista",                valorHora: 40,  jornadaMinima: 4, valorTotal: 160, taxaRetencao: 32,  freelancerRecebe: 128 },
    { serviceId: "14", label: "DJ",                        valorHora: 150, jornadaMinima: 3, valorTotal: 450, taxaRetencao: 90,  freelancerRecebe: 360 },
    { serviceId: "15", label: "Músico (Sertanejo)",        valorHora: 170, jornadaMinima: 3, valorTotal: 510, taxaRetencao: 102, freelancerRecebe: 408 },
    { serviceId: "16", label: "Músico (Rock)",             valorHora: 170, jornadaMinima: 3, valorTotal: 510, taxaRetencao: 102, freelancerRecebe: 408 },
    { serviceId: "17", label: "Músico (Samba/Pagode)",     valorHora: 170, jornadaMinima: 3, valorTotal: 510, taxaRetencao: 102, freelancerRecebe: 408 },
    { serviceId: "18", label: "Músico (MPB)",              valorHora: 170, jornadaMinima: 3, valorTotal: 510, taxaRetencao: 102, freelancerRecebe: 408 },
    { serviceId: "19", label: "Músico (Multi Estilo)",     valorHora: 170, jornadaMinima: 3, valorTotal: 510, taxaRetencao: 102, freelancerRecebe: 408 },
  ],
};

export function getTarifa(modulo: ModuloTarifas, serviceId: string): Tarifa | undefined {
  return TARIFAS[modulo].find((t) => t.serviceId === serviceId);
}
