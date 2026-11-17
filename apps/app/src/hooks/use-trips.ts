import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';

// Hono RPC + TanStack Query v5 によるデータ取得フック (docs/01_Requirements/screen_spec.md 準拠)
export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await apiClient.api.trips.$get();
      if (!res.ok) {
        throw new Error('旅行一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
};
