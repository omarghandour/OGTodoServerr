const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.POSTGRES_HOST,
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
  port: process.env.DBPORT,
  database: "verceldb",
});
module.exports = pool;
