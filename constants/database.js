const DATABASE_CONFIG = {
  development: {
    dialect: "sqlite",
    storage: "./data.sqlite",
    logging: console.log,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
};

module.exports = {
  DATABASE_CONFIG,
};
