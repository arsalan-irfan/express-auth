const Sequelize = require("sequelize");
const sequelize = require("../config/dbConfig");
const Model = Sequelize.Model;
class User extends Model {}
User.init(
  {
    // attributes
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastname: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    source: {
      type: Sequelize.STRING,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "user",
    // options
    indexes: [
      {
        unique: true,
        fields: ["user_id", "email"]
      }
    ]
  }
);

module.exports = User;
