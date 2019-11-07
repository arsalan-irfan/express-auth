const express = require("express");
const app = express();
const sequelize = require("./config/dbConfig");
const bodyParser = require("body-parser");

const port = 5000;
app.use(bodyParser.json({ type: "application/json" }));

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

app.use("/auth", require("./routes/auth"));

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
