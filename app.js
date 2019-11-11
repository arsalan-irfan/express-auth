const express = require("express");
const app = express();
const sequelize = require("./config/dbConfig");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const swaggerDoc=require('./swaggerDoc');

const port = 5000;
app.use(bodyParser.json({ type: "application/json" }));
dotenv.config();
const endpoints=require('./routes/endpoints');
endpoints(app)
swaggerDoc(app);
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

app.get("/",(req,res)=>{res.send("App is running").status(200)})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
module.exports=app