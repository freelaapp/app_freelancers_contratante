import { api } from "@/services/api";
import type { CandidatoApi } from "@/types/vagas";

type ProviderPublicProfile = {
  id: string;
  name?: string;
  averageRating?: number;
  completedJobsCount?: number;
  profile?: { jobTitle?: string; avatarUrl?: string };
};

async function fetchProviderProfile(providerId: string): Promise<ProviderPublicProfile | null> {
  try {
    const { data } = await api.get<ProviderPublicProfile>(
      `/v1/users/providers/${providerId}`,
      { _suppressToast: true }
    );
    return data;
  } catch {
    return null;
  }
}

type RawCandidacySingle = {
  id?: string;
  providerGlobalId?: string;
  status?: string;
};

async function fetchProviderProfileByCandidacyId(candidacyId: string): Promise<ProviderPublicProfile | null> {
  try {
    const { data } = await api.get<RawCandidacySingle>(
      `/v1/bars-restaurants/candidacies/${candidacyId}`,
      { _suppressToast: true }
    );
    if (!data?.providerGlobalId) return null;
    return fetchProviderProfile(data.providerGlobalId);
  } catch {
    return null;
  }
}

type RawCandidacy = CandidatoApi & {
  providerGlobalId?: string;
  freelancerId?: string;
  providerId?: string;
  provider?: { id?: string; name?: string; jobTitle?: string; avatarUrl?: string };
  freelancer?: { id?: string; name?: string; jobTitle?: string; avatarUrl?: string };
  freelancerName?: string;
  providerName?: string;
};

function extractProviderId(c: RawCandidacy): string | undefined {
  return (
    c.providerGlobalId ??
    c.freelancerId ??
    c.providerId ??
    c.provider?.id ??
    c.freelancer?.id ??
    (c as Record<string, unknown>).barsRestaurantsProviderId as string | undefined ??
    (c as Record<string, unknown>).moduleProviderId as string | undefined
  );
}

function extractEmbeddedName(c: RawCandidacy): string | undefined {
  return (
    c.name ??
    c.freelancerName ??
    c.providerName ??
    c.provider?.name ??
    c.freelancer?.name
  );
}

function extractEmbeddedRole(c: RawCandidacy): string | undefined {
  return (
    c.role ??
    (c.provider?.jobTitle) ??
    (c.freelancer?.jobTitle)
  );
}

export const candidaturasService = {
  async listByVacancy(vacancyId: string): Promise<CandidatoApi[]> {
    const { data } = await api.get<RawCandidacy[]>(
      `/v1/bars-restaurants/candidacies/vacancies/${vacancyId}`
    );
    const rawList: unknown[] = Array.isArray(data) ? data : [];
    const list: RawCandidacy[] = rawList.map((item) => {
      const raw = item as Record<string, unknown>;
      return (raw.props && typeof raw.props === "object"
        ? raw.props
        : raw) as RawCandidacy;
    });

    const enriched = await Promise.all(
      list.map(async (c, i) => {
        const safeId = c.id ?? `candidato-${i}`;
        const embeddedName = extractEmbeddedName(c);
        const embeddedRole = extractEmbeddedRole(c);

        const pid = extractProviderId(c);

        let profile: ProviderPublicProfile | null = null;

        if (pid) {
          profile = await fetchProviderProfile(pid);
        }

        if (!profile) {
          profile = await fetchProviderProfileByCandidacyId(safeId);
        }

        if (!profile) {
          return { ...c, id: safeId, name: embeddedName ?? c.name, role: embeddedRole ?? c.role };
        }

        return {
          ...c,
          id: safeId,
          name: profile.name ?? embeddedName ?? c.name,
          role: profile.profile?.jobTitle ?? embeddedRole ?? c.role,
          rating: profile.averageRating ?? c.rating,
          jobCount: profile.completedJobsCount ?? c.jobCount,
          avatarUrl: profile.profile?.avatarUrl ?? c.avatarUrl,
        };
      })
    );
    return enriched;
  },

  async accept(candidacyId: string): Promise<void> {
    await api.patch("/v1/bars-restaurants/candidacies/accept", { candidacyId });
  },

  async reject(candidacyId: string): Promise<void> {
    await api.patch("/v1/bars-restaurants/candidacies/reject", { candidacyId });
  },
};
