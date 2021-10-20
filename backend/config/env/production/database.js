const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

module.exports = () => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "postgres",
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password: config.password,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      options: {},
    },
  },
});
