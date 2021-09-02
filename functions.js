/**
 *Description of functions
 *@author Michel Mosberger
 *@version 1.0
 *@since 10.08.2021
 */

const symbols = require("./symbols.json");
const Database = require("./database");
const userlist = require('./users.json');
const nodemailer = require("nodemailer");
require('dotenv').config();


let testIds = [];

class functions {

    static async createTests(message) {

        let url;


        let testString = `INSERT INTO test (url, finished, user_id, create_date)
                          VALUES `
        let testvalues = [];


        let users = await Database.query(`SELECT *
                                          FROM user`, []);

        for (let user of users) {
            url = this.generateURL()
            let finished = 0;

            let urlcheck = await Database.query(`SELECT *
                                                 FROM test
                                                 WHERE url = (?)`, [url])

            while (urlcheck.length > 0) {
                url = this.generateURL()
                urlcheck = await Database.query(`SELECT *
                                                 FROM test
                                                 WHERE url = (?)`, [url])
            }

            message.channel.send(url)

            testString += `(?, ?, ?, ?), `
            testvalues.push(url, finished, user.id, new Date())

            let transporter = nodemailer.createTransport({
                host: "smtp.office365.com",
                secureConnection: false,
                port: 587,
                tls: {
                    ciphers: 'SSLv3'
                },
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.MAIL_PASSWORD
                }
            });
            let person = userlist.find(x => x.id === user.id)
            let mailOptions = {
                from: '"Michel Mosberger" <michel.mosberger@stud.lgr.ch>',
                to: person.email,
                subject: 'Schlaf - Konzentrationsfähigkeit',
                text: 'Hello world ',
                html: `<p><b>Liebe/Lieber ${person.first_name}</b></p>
                    Dein Test ist für dich bereit. Du kannst ihn unter <a href="https://konzentrationstest.ch/test/${url}">konzentrationstest.ch/test/${url}</a> besuchen. Bei fragen kannst du mir gerne ein e-mail schreiben. Ich wünsche dir viel Erfolg dabei.</p>
                    
                    <p>Beste Grüsse,</p>
                    
                    <p>Michel Mosberger</p>`
            };

            /*transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }

                console.log('Message sent: ' + info.response);
            });*/
        }

        testString = testString.replace(/,\s*$/, "");

        let inserted = await Database.query(testString, testvalues)
        let lastIds = await Database.query(`SELECT id
                                            FROM test
                                            WHERE id >= (?)`, inserted.insertId)
        for (const ids of lastIds) {
            testIds.push(ids.id)
        }


        for (let id of testIds) {

            let legende = [];
            let numbers = [];

            for (let i = 0; i < 9; i++) {
                let int = getRndInteger(0, (symbols.length - 1));

                while (legende.includes(symbols[int].id)) {
                    int = getRndInteger(0, (symbols.length) - 1);
                }

                legende.push(symbols[int].id);
            }

            for (let i = 0; i < 100; i++) {
                let int = getRndInteger(0, 8);

                while (numbers[i - 1] === legende[int]) {
                    int = getRndInteger(0, 8)
                }

                numbers.push(legende[int])
            }



            let answersValues = [];
            let iconids = [];

            for (let i = 0; i < 9; i++) {

                let icon_no = i+1;
                let icon_id = legende[i];
                let test_id = id

                let iconsString = `INSERT INTO icons (icon_no, icon_id, test_id) VALUES (?, ?, ?)`;

                let iconsValues = [icon_no, icon_id, id]

                let ICONS = await Database.query(iconsString, iconsValues);

                let iconobj = {
                    "icon_no": icon_no,
                    "icon_id": icon_id,
                    "id": ICONS.insertId
                }

                iconids.push(iconobj)

            }
            let answersString = "INSERT INTO answers (answer_no, icons_id, test_id) VALUES ";

            let i = 1;
            for (let number of numbers) {

                let iconsID = iconids.find(x => x.icon_id === number).id

                answersString += '(?, ?, ?), '
                answersValues.push(i, iconsID, id);
                i++
            }

            answersString = answersString.replace(/,\s*$/, "");
            await Database.query(answersString, answersValues);
        }
    };

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