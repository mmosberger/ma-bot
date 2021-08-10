const Discord = require('discord.js');
require("dotenv").config()
let db = require("./database")

const client = new Discord.Client();

client.on('ready', () => {
    db.init()
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot){
        return;
    }

    if (message.content === 'ping') {
        message.reply('pong');
    }
});

client.login(process.env.TOKEN);