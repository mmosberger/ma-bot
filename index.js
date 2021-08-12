const {Client} = require('discord.js');
require("dotenv").config();
const functions = require("./functions");
const symbols = require('./symbols.json')


const client = new Client();

let pickedSymbolsLegende = [];
let pickedSymbols = [];
let answerNumbers = [];


// Ready event
client.on('ready', async () => {
    console.log(`${client.user.tag} is ready!`);
});


client.on('message', async (message) => {

    if (message.author.bot || !message.guild) return;

    let prefix = process.env.PREFIX;
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    if (!message.content.startsWith(prefix)) return;
    if (message.guild && !message.member) await message.guild.fetch.members(message.author);

    switch (command) {
        case 'create':
            await functions.createTests()
            let msg = await message.reply(":warning: Tests sind in Erstellung...")

            setTimeout(function () {
                msg.edit(":white_check_mark: Tests wurden erstellt und den Leuten zugestellt.",)
            }, 5000)

            break;
        default:
            await message.reply("...")
    }
});

client.login(process.env.TOKEN)
