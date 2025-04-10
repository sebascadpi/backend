const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const csvRoutes = require("./routes/csv-routes");

const app = express();
const port = 3000;

app.use(cors());
app.use("/api/experiments", csvRoutes);

const initializeServer = async () => {
  try {
    await sequelize.sync();
    console.log("Database initialized");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
};

initializeServer();
