import { api, ApiResponse } from './api';
import { PublicEarningsResponse } from '@/types/earnings';

export interface GetPublicEarningsParams {
  username: string;
  limit?: number;
  offset?: number;
}

export async function getPublicEarnings({
  username,
  limit = 100,
  offset = 0,
}: GetPublicEarningsParams): Promise<ApiResponse<PublicEarningsResponse>> {
  const params = new URLSearchParams({
    username,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  return api.get<PublicEarningsResponse>(
    `/users/earnings/public?${params.toString()}`
  );
}
