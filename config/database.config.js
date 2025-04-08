module.exports = {
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
