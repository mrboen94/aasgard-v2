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
        host: host,
        port: port,
        database: database,
        username: username,
        password: password,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      options: {},
    },
  },
});
