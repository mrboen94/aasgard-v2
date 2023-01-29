/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ['jsx', 'tsx', 'js', 'ts'],
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
