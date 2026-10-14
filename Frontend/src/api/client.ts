import { handleMockFallback } from '@/mocks/fallback';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // If running with mock backend, resolve immediately via in-memory mock router
  if (USE_MOCKS) {
    return await handleMockFallback<T>(endpoint, options);
  }

  const { token, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: requestHeaders,
    ...rest,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Non-JSON response
    }
    throw new ApiError(response.status, errorMessage);
  }

  return (await response.json()) as T;
}
