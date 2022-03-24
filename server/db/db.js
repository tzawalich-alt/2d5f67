const Sequelize = require("sequelize");


// const db = new Sequelize(process.env.DATABASE_URL || "postgres://localhost:5432/messenger", {
//   logging: false
// });

//Local dbname, user name, password -- not secure, do not use password as a password outside of local testing
const db = new Sequelize(process.env.DATABASE_URL || "messenger", "postgres", "password", {
  logging: false,
  host: "localhost",
  port: 5432,
  dialect: "postgres"
});

module.exports = db;
