import { useAuth } from "@/context/auth-context";
import { vagasService } from "@/services/vagas.service";
import type { VagaApi } from "@/types/vagas";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseExploreReturn = {
  vagas: VagaApi[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  search: string;
  activeServiceFilter: string;
  filteredVagas: VagaApi[];
  setSearch: (value: string) => void;
  setActiveServiceFilter: (id: string) => void;
  refresh: () => Promise<void>;
  retry: () => void;
};

export function useExplore(): UseExploreReturn {
  const { user } = useAuth();
  const [vagas, setVagas] = useState<VagaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeServiceFilter, setActiveServiceFilter] = useState("todos");

  const fetchVagas = useCallback(async () => {
    if (!user?.module) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await vagasService.list(user.module);
      setVagas(data);
    } catch {
      setError("Não foi possível carregar as vagas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user?.module]);

  useEffect(() => {
    fetchVagas();
  }, [fetchVagas]);

  const refresh = useCallback(async () => {
    if (!user?.module) return;
    setRefreshing(true);
    setError(null);
    try {
      const data = await vagasService.list(user.module);
      setVagas(data);
    } catch {
      setError("Não foi possível atualizar as vagas. Tente novamente.");
    } finally {
      setRefreshing(false);
    }
  }, [user?.module]);

  const retry = useCallback(() => {
    setLoading(true);
    fetchVagas();
  }, [fetchVagas]);

  const filteredVagas = useMemo(() => {
    let result = vagas;

    if (activeServiceFilter !== "todos") {
      result = result.filter((v) => {
        const serviceType = (v.serviceType as string | undefined) ?? "";
        return serviceType.toLowerCase().includes(activeServiceFilter.toLowerCase());
      });
    }

    if (search.trim().length > 0) {
      const normalizedSearch = search.trim().toLowerCase();
      result = result.filter((v) => {
        const title = (v.title ?? "").toLowerCase();
        const serviceType = (v.serviceType as string | undefined ?? "").toLowerCase();
        return title.includes(normalizedSearch) || serviceType.includes(normalizedSearch);
      });
    }

    return result;
  }, [vagas, search, activeServiceFilter]);

  return {
    vagas,
    loading,
    refreshing,
    error,
    search,
    activeServiceFilter,
    filteredVagas,
    setSearch,
    setActiveServiceFilter,
    refresh,
    retry,
  };
}
