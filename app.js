const express = require("express");
const app = express();
const sequelize = require("./config/dbConfig");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const port = 5000;
const cors=require('cors');
app.use(bodyParser.json({ type: "application/json" }));
dotenv.config();
app.use(cors());
const endpoints=require('./routes/endpoints');
var userAPI = require('./routes/endpoints');
//apidoc -f "controllers/.*\\.js$" -i ./  -o apidoc/
app.use('/apidoc', express.static('apidoc'));
app.use('/api/v1/user', userAPI);
app.use(require('cookie-parser')());
app.use(methodOverride('_method'));
endpoints(app)
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