/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['pages', 'components', 'lib', 'src']
  },
  reactStrictMode: true,
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.cache = false;
    return config
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  compiler: {
    removeConsole: process.env.APP_ENV === 'live',
  }
};

module.exports = nextConfig;
