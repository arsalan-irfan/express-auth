const Sequelize = require("sequelize");
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
const sequelize = new Sequelize("Auth", "root", "a1b2c3d4", {
  dialect: "mysql"
});

module.exports = sequelize;
