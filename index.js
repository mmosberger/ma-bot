const { Client, MessageEmbed } = require('discord.js');
const mysql = require("mariadb");
require("dotenv").config();

const client = new Client();

let pool = mysql.createPool({
    "host": "127.0.0.1",
    "user": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE
});

pool.getConnection().then((conn) => {
    console.log("DB connected")
}).catch((err) => {
    console.error("Unable to connect to the MariaDB database." + err);
});

// Ready event
client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`);
});


client.on('message', async (message) => {

    if (message.author.bot || !message.guild) return;



});

client.login(process.env.TOKEN);


async function query(string, values) {
    return new Promise((resolve, reject) => {
        pool.query(string, values, (error, results) => {
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
