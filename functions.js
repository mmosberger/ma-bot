/**
 *Description of functions
 *@author Michel Mosberger
 *@version 1.0
 *@since 10.08.2021
 */

const symbols = require("./symbols.json");
const Database = require("./database");
const userlist = require('./users.json');
const moment = require("moment");
const nodemailer = require("nodemailer");
require('dotenv').config();


let pickedSymbolsLegende = [];
let pickedSymbols = [];
let answerNumbers = [];
let testIds = [];

class functions {

    static async createTest() {

        let url;


        let testString = `INSERT INTO test (url, finished, user_id, create_date) VALUES `
        let testvalues = [];



        Database.query(`SELECT * FROM user`, []).then(async (users) => {

            for (let user of users) {
                url = this.generateURL()
                let finished = 1;
                let date = moment().format('YYYY-MM-DD h:mm:ss');

                let urlcheck = await Database.query(`SELECT * FROM test WHERE url = (?)`, [url])

                while(urlcheck.length > 0){
                    url = this.generateURL()
                }

                testString += `(?, ?, ?, ?), `
                testvalues.push(url, finished, user.id, date)

                let transporter = nodemailer.createTransport({
                    host: "smtp.office365.com",
                    secureConnection: false,
                    port: 587,
                    tls: {
                        ciphers:'SSLv3'
                    },
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.MAIL_PASSWORD
                    }
                });
                let mailOptions = {
                    from: '"Michel Mosberger" <michel.mosberger@stud.lgr.ch>',
                    to: userlist.find(x => x.id === user.id).email,
                    subject: 'Test ',
                    text: 'Hello world ',
                    html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js'
                };

                /**transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }

                    console.log('Message sent: ' + info.response);
                });**/
            }

            testString = testString.replace(/,\s*$/, "");
            await Database.query(testString, testvalues).then(async (data) => {

                await Database.query(`SELECT id FROM test WHERE id >= (?)`, data.insertId).then(async (a) => {
                    for (const ids of a){
                        testIds.push(ids.id)
                    }
                })
            })

            let iconsString = `INSERT INTO icons (icon_no, icon_id, test_id) VALUES `
            let iconsValues = [];

            for (let id of testIds){

                let legende = [];

                for (let i = 0; i < 9; i++) {
                    let int = getRndInteger(0, (symbols.length - 1));

                    while (legende.includes(symbols[int].id)) {
                        int = getRndInteger(0, (symbols.length) - 1);
                    }

                    legende.push(symbols[int].id);
                }

                for (let icon of legende){
                    for (let i = 1; i < 10; i++){
                        iconsString += '(?, ?, ?), '
                        iconsValues.push(i, icon, id)
                    }
                }

            }
            iconsString = iconsString.replace(/,\s*$/, "");

            console.log(iconsValues);
        })
    };


    static pickLegend(){

        //let legendString =
        for (let i = 0; i < 9; i++) {
            let int = getRndInteger(0, (symbols.length - 1));

            while (pickedSymbolsLegende.includes(symbols[int].id)) {
                int = getRndInteger(0, (symbols.length) - 1);
            }

            pickedSymbolsLegende.push(symbols[int].id);
        }
        /**for (let i = 1; i < 10; i++){

        }**/

        console.log(pickedSymbolsLegende)


    }



    static generateURL() {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 25; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = functions