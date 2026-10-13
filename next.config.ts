import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const imageHosts = [
  process.env.NEXT_PUBLIC_API_URL,
  ...(process.env.NEXT_PUBLIC_IMAGE_DOMAINS ?? '').split(',').map((item) => item.trim()),
]
  .filter((value): value is string => Boolean(value))
  .flatMap((value) => {
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      return [{ protocol: url.protocol.replace(':', '') as 'http' | 'https', hostname: url.hostname }];
    } catch {
      return [];
    }
  });

const remotePatterns: Array<{ protocol: 'http' | 'https'; hostname: string }> = [
  { protocol: 'https', hostname: 'api.cnc.onaka.ao' },
  ...imageHosts.map(({ protocol, hostname }) => ({ protocol, hostname })),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
};

export default withNextIntl(nextConfig);
