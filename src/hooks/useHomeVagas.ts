import { useCallback, useEffect, useState } from "react";
import { vagasService } from "@/services/vagas.service";
import { toast } from "@/utils/toast";
import { useAuth } from "@/context/auth-context";
import type { VagaApi } from "@/types/vagas";

type UseHomeVagasResult = {
  vagas: VagaApi[];
  loading: boolean;
  refreshing: boolean;
  fetchVagas: () => Promise<void>;
  onRefresh: () => void;
};

export function useHomeVagas(): UseHomeVagasResult {
  const { user } = useAuth();
  const [vagas, setVagas] = useState<VagaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVagas = useCallback(async () => {
    if (!user?.contractorId || !user?.module) {
      setLoading(false);
      return;
    }

    try {
      const data = await vagasService.listByContractor(user.module, user.contractorId);
      setVagas(data);
    } catch {
      toast.error("Não foi possível carregar as vagas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user?.contractorId, user?.module]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    vagasService
      .listByContractor(user?.module!, user?.contractorId!)
      .then(setVagas)
      .catch(() => toast.error("Não foi possível atualizar as vagas."))
      .finally(() => setRefreshing(false));
  }, [user?.contractorId, user?.module]);

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  return { vagas, loading, refreshing, fetchVagas, onRefresh };
}
