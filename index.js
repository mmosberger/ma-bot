const {Client} = require('discord.js');
require("dotenv").config();
const functions = require("./functions");
const users = require('./users.json')


const client = new Client();


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

    if(!message.member.hasPermission("ADMINISTRATOR")) return;

    switch (command) {
        case 'create':
            await functions.generateTests(message)
            let msg = await message.reply(":warning: Tests sind in Erstellung...")

            setTimeout(function () {
                msg.edit(":white_check_mark: Tests wurden erstellt und den Leuten zugestellt.",)
            }, 5000)

            break;

        case 'teacher':
            await functions.generateTeacherTests(message)
            let msssg = await message.reply(":warning: Tests sind in Erstellung...")

            setTimeout(function () {
                msssg.edit(":white_check_mark: Tests wurden erstellt und den Leuten zugestellt.",)
            }, 5000)

            break;

        case 'email':
            message.channel.send(users.map((u) => u.email).join('; '))
            break;

        default:
            await message.channel.send("...")
    }
});

client.login(process.env.TOKEN)
