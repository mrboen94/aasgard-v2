module.exports = {
  provider: "do",
  providerOptions: {
    key: process.env.DO_SPACE_ACCESS_KEY,
    secret: process.env.DO_SPACE_SECRET_KEY,
    endpoint: process.env.DO_SPACE_ENDPOINT,
    directory: process.env.DO_SPACE_DIRECTORY,
  },
};
