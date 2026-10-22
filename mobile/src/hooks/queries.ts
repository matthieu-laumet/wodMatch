import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { Competition, EventMode, Favorite, SearchMode, Tag } from '../types/competition';
import { useWodzoneApi, useWodmatchApi } from '@/lib/api';

export const useTags = () => {
  const api = useWodzoneApi();
  return useQuery<Tag[]>({ queryKey: ['tags'], queryFn: () => api('/tags/get-all-tags'), staleTime: 10 * 60_000 });
};

export const useEventModes = () => {
  const api = useWodzoneApi();
  return useQuery<EventMode[]>({
    queryKey: ['eventModes'],
    queryFn: () => api('/competitions/event-modes'),
    staleTime: 10 * 60_000,
  });
};

export const useWZCompetitions = () => {
  const api = useWodmatchApi();
  return useQuery<Competition[]>({
    queryKey: ['competitions'],
    queryFn: () => api('/competitions/get-wz-competitions'),
  });
};

export const useFavorites = () => {
  const api = useWodzoneApi();
  return useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => api('/favorites/get-user-compet-favorites'),
  });
};

// Optimistic update + rollback dans le cache
export const useToggleFavorite = () => {
  const api = useWodzoneApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id_competition: number) =>
      api('/favorites/toggle-user-compet-favoris', {
        method: 'POST',
        body: JSON.stringify({ id_competition }),
      }),
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: ['favorites'] });
      const prev = qc.getQueryData<Favorite[]>(['favorites']);
      qc.setQueryData<Favorite[]>(['favorites'], old => {
        const list = old ?? [];
        return list.some(f => f.id_competition === id)
          ? list.filter(f => f.id_competition !== id)
          : [...list, { id_competition: id }];
      });
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['favorites'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
};

export const useShowProfile = () => {
  const api = useWodmatchApi();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: () =>
      api('/users/handle-hide-user-profil', { method: 'PUT', body: JSON.stringify({ is_hidden: false }) }),
    onSuccess: () => updateUser({ is_hidden: false }),
  });
};

// Même queryKey que useWZCompetitions : le cache est partagé, pas de nouvelle requête
export const useCompetition = (id: number) => {
  const api = useWodmatchApi();
  return useQuery<Competition[], Error, Competition | undefined>({
    queryKey: ['competitions'],
    queryFn: () => api('/competitions/get-wz-competitions'),
    select: data => data.find(c => c.id_competition === id),
  });
};

export const useSearchModes = () => {
  const api = useWodmatchApi();
  return useQuery<SearchMode[]>({
    queryKey: ['searchModes'],
    queryFn: () => api('/searchModes/gets-all-searchModes'),
    staleTime: 10 * 60_000,
  });
};

// Le mode actif vit dans user.id_search_mode (AuthContext) : update optimiste + rollback
export const useHandleUserSearchMode = () => {
  const api = useWodmatchApi();
  const { user, updateUser } = useAuth();
  return useMutation({
    mutationFn: (id_search_mode: number) =>
      api('/searchModes/handle-user-search-mode', {
        method: 'POST',
        body: JSON.stringify({ id_search_mode }),
      }),
    onMutate: id => {
      const prev = user?.id_search_mode;
      updateUser({ id_search_mode: id });
      return { prev };
    },
    onError: (_e, _id, ctx) => updateUser({ id_search_mode: ctx?.prev }),
  });
};