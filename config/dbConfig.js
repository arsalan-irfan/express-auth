const Sequelize=require('sequelize')
const sequelize = new Sequelize('Auth', 'root', 'a1b2c3d4', {
    dialect: 'mysql'
  })

  module.exports=sequelize;