const pg = require("pg");
const logger = require("../middleware/winston");

const db_config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "127.0.0.1",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 10,
};

let db_connection;

function startConnection() {

  db_connection = new pg.Pool(db_config);

  db_connection.connect((err, client) => {
    if (!err) {
      logger.info("PostgreSQL Connected");
    } else {
      console.log(err)
      logger.error("PostgreSQL Connection Failed");
      startConnection();
    }
  });

  db_connection.on("error", (err, client) => {
    logger.error("Unexpected error on idle client");
    startConnection();
  });
}

startConnection();

setInterval(function () {
  db_connection.query("SELECT $1", [1], (err, res) => {
    if (err) logger.error("SELECT 1", err.message);
  });
}, 3000);

module.exports = db_connection;