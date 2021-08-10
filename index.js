const Discord = require('discord.js');
require("dotenv").config()

const client = new Discord.Client();

client.on('ready', () => {
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