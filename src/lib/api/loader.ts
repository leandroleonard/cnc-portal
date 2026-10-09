import { ApiConfigurationError } from './client';

export type LoadResult<T> = { data: T; error: null } | { data: null; error: Error };

export async function loadApi<T>(loader: () => Promise<T>): Promise<LoadResult<T>> {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : error instanceof ApiConfigurationError ? error : new Error('Unexpected API error.'),
    };
  }
}

export function apiErrorDescription(error: Error, configuredMessage: string, unavailableMessage: string): string {
  return error instanceof ApiConfigurationError ? configuredMessage : unavailableMessage;
}
