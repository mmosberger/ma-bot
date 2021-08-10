/**
 *Description of database.js
 *@author Michel Mosberger
 *@version 1.0
 *@since 10.08.2021
 */



const mysql = require("mariadb");

let db = {};


async function init() {
    db.pool = mysql.createPool({
        "host": "127.0.0.1",
        "user": process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_PASSWORD
    });

    /**
     * Get db connection or throw error
     */
    db.pool.getConnection().then((conn) => {
        console.log("DB connected")
    }).catch((err) => {
        console.error("Unable to connect to the MariaDB database." + err);
    });
}


// Make a new query to the db
async function query(string, values) {
    return new Promise((resolve, reject) => {
        db.pool.query(string, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        }).then(r =>
            resolve(r)
        ).catch(O_o => {
            console.log(O_o);
        });
    });
}

db.query = query()
db.init = init()

module.exports = {
    query,
    init
}
