const { Client, MessageEmbed } = require('discord.js');
require("dotenv").config();
let db = require("./database")

const symbols = [
    "↔", "∏", "↕", "―", "Ѱ", "ф", "Σ", "˄", "X", "∟", "≤", "≠", "U", "=", "!", "0"
]
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
let pickedSymbolsLegende = [];
let pickedSymbols = [];
let answerNumbers = [];


const client = new Client();


// Ready event
client.on('ready', () => {
    console.log(`${client.user.tag} is ready!`);
});


client.on('message', async (message) => {

    if (message.author.bot || !message.guild) return;

    let prefix = process.env.PREFIX;
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();

    if (!message.content.startsWith(prefix)) return;
    if (message.guild && !message.member) await message.guild.fetch.members(message.author);

    let member = message.guild.member(message.mentions.users.first() || args[0]);

    switch(command){
        case 'create':


            break;
    }
});

client.login(process.env.TOKEN);

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function create_symbols(){
    for (let i = 0; i < 9; i++) {
        let int = getRndInteger(0, (symbols.length - 1));

        while (pickedSymbolsLegende.includes(symbols[int])) {
            int = getRndInteger(0, (symbols.length) - 1);
        }

        pickedSymbolsLegende.push(symbols[int]);
    }

    for (let i = 0; i < 100; i++) {

        let num = getRndInteger(0, 8)

        while (pickedSymbolsLegende[i-1] === pickedSymbolsLegende[num]) {
            num = getRndInteger(1,9);
        }
        answerNumbers.push(num)
        pickedSymbols.push(pickedSymbolsLegende[num]);

    }
}
