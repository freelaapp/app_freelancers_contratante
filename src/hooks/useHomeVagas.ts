import { useCallback, useEffect, useState } from "react";
import { vagasService } from "@/services/vagas.service";
import { toast } from "@/utils/toast";
import { useAuth } from "@/context/auth-context";
import { debug } from "@/utils/debug";
import { addOptimisticVaga, getOptimisticVagas } from "@/utils/optimistic-vagas-store";
import type { VagaApi } from "@/types/vagas";

type UseHomeVagasResult = {
  vagas: VagaApi[];
  loading: boolean;
  refreshing: boolean;
  fetchVagas: () => Promise<void>;
  onRefresh: () => void;
  addVaga: (vaga: VagaApi) => void;
};

function mergeWithOptimistic(fromApi: VagaApi[], optimistic: VagaApi[]): VagaApi[] {
  if (optimistic.length === 0) return fromApi;
  const apiIds = new Set(fromApi.map((v) => v.id));
  const stillMissing = optimistic.filter((v) => !apiIds.has(v.id));
  return [...stillMissing, ...fromApi];
}

export function useHomeVagas(): UseHomeVagasResult {
  const { user } = useAuth();
  const [vagas, setVagas] = useState<VagaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVagas = useCallback(async () => {
    if (!user?.module) {
      setLoading(false);
      return;
    }

    if (!user?.contractorId) {
      debug.warn("useHomeVagas", "contractorId ausente");
      setLoading(false);
      toast.error("Perfil incompleto. Faça login novamente.");
      return;
    }

    debug.log("useHomeVagas", "buscando vagas", { module: user.module, contractorId: user.contractorId });

    try {
      const data = await vagasService.listByContractor(user.module, user.contractorId);
      debug.log("useHomeVagas", "vagas recebidas", data);
      const apiList = Array.isArray(data) ? data : [];
      const merged = mergeWithOptimistic(apiList, getOptimisticVagas());
      setVagas(merged);
    } catch (err) {
      debug.error("useHomeVagas", "erro ao buscar vagas", err);
      toast.error("Não foi possível carregar as vagas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user?.contractorId, user?.module]);

  const onRefresh = useCallback(() => {
    if (!user?.module || !user?.contractorId) return;
    setRefreshing(true);
    vagasService
      .listByContractor(user.module, user.contractorId)
      .then((data) => {
        const apiList = Array.isArray(data) ? data : [];
        const merged = mergeWithOptimistic(apiList, getOptimisticVagas());
        setVagas(merged);
      })
      .catch(() => toast.error("Não foi possível atualizar as vagas."))
      .finally(() => setRefreshing(false));
  }, [user?.contractorId, user?.module]);

  const addVaga = useCallback((vaga: VagaApi) => {
    addOptimisticVaga(vaga);
    setVagas((prev) => {
      if (prev.some((v) => v.id === vaga.id)) return prev;
      return [vaga, ...prev];
    });
  }, []);

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  return { vagas, loading, refreshing, fetchVagas, onRefresh, addVaga };
}
