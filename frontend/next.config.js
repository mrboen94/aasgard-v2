/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  distDir: "build",
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
  i18n: {
    locales: ["en", "nb"],
    defaultLocale: "en",
  },
};
