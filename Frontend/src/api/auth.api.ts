import { apiClient } from './client';
import type { AuthResponse } from '@/types';

export async function requestOtp(phone: string): Promise<{ ok: boolean }> {
  return apiClient<{ ok: boolean }>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}
