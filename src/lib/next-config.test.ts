import { describe, expect, it } from 'vitest';
import { nextConfig } from '../../next.config';

describe('Next image config', () => {
  it('allows the local Laravel API host while preserving remote image protection', () => {
    const imageConfig = nextConfig.images as {
      remotePatterns?: Array<{ protocol: string; hostname: string }>;
      dangerouslyAllowLocalIP?: boolean;
    };

    expect(imageConfig.dangerouslyAllowLocalIP).toBe(true);
    expect(imageConfig.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ protocol: 'http', hostname: 'localhost' }),
      ]),
    );
  });
});
