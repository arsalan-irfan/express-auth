const express = require("express");
const app = express();
const sequelize = require("./config/dbConfig");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const port = 5000;
app.use(bodyParser.json({ type: "application/json" }));
dotenv.config();
const endpoints=require('./routes/endpoints');
endpoints(app)
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
