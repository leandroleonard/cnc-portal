import { describe, expect, it } from 'vitest';
import { ApiConfigurationError, ApiError } from './client';

describe('API errors', () => {
  it('preserves backend status and field-level validation errors', () => {
    const error = new ApiError(422, { code: 'validation_failed', message: 'Validation failed', errors: { email: ['Invalid email'] }, requestId: 'req-1' });
    expect(error.status).toBe(422);
    expect(error.fieldErrors?.email?.[0]).toBe('Invalid email');
    expect(error.requestId).toBe('req-1');
  });

  it('exposes a dedicated configuration error when the API base URL is missing', () => {
    expect(new ApiConfigurationError()).toBeInstanceOf(Error);
  });
});
