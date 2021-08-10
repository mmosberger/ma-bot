const mysql = require("mysql");

class Database {
    static query = async (string, values) => {
        let pool = mysql.createConnection(
            {
                host: "127.0.0.1",
                user: process.env.USER,
                password: process.env.PASSWORD,
                database: process.env.DATABASE
            }
        );

        pool.connect(function (err) {
            if (err) {
                console.log("Unable to connect to the MySQL database." + err);
            }
        });

        return new Promise((resolve, reject) => {
            pool.query(string, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });

            pool.end();

        });
    }
}


module.exports = Database;