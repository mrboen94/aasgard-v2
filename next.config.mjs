/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ['jsx', 'tsx', 'js', 'ts'],
  unstable_includeFiles: ['node_modules/.pnpm/**/shiki/**/*.json'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    newNextLinkBehavior: true,
    scrollRestoration: true,
  },
  images: {
    domains: ['cdn.sanity.io'],
  },
}

export default nextConfig
