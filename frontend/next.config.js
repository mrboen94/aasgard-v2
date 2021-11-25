/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  distDir: "build",
  images: {
    domains: [
      "localhost",
      "res.cloudinary.com",
      "aasgard.ams3.digitaloceanspaces.com",
      "https://aasgard.netlify.app/",
    ],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};
