/**
 *Description of statics
 *@author Michel Mosberger
 *@version 1.0
 *@since 10.08.2021
 */

const symbols = require("./symbols.json");
const Database = require("./database");
const userlist = require('./users.json');
const nodemailer = require("nodemailer");
require('dotenv').config();


let usedIcons;
let iconIds;

class statics {

    static async generateTests(message) {

        let users = await Database.query(`SELECT *
                                          FROM user WHERE disabled =?`, [0]);

        for (let user of users) {

            usedIcons = [];
            iconIds = [];
            let url;

            let test = {
                url: url = this.generateUrl(),
                user_id: user.id,
                finished: 0,
                create_date: new Date()
            }


            let testId = await Database.query(
                `INSERT INTO test (url, finished, create_date, user_id)
                 VALUES (?, ?, ?, ?)`,
                [test.url, test.finished, test.create_date, test.user_id]);

            await this.createAllIcons(testId);

            await this.createAllAnswers(testId);

            await this.sendMail(user, url);

            message.channel.send(`${url}, ${user.name}`)
        }
    }

    static async generateTeacherTests(message) {

        let users = await Database.query(`SELECT *
                                          FROM user WHERE disabled =?`, [1]);

        for (let user of users) {

            usedIcons = [];
            iconIds = [];
            let url;

            let test = {
                url: url = this.generateUrl(),
                user_id: user.id,
                finished: 0,
                create_date: new Date()
            }


            let testId = await Database.query(
                `INSERT INTO test (url, finished, create_date, user_id)
                 VALUES (?, ?, ?, ?)`,
                [test.url, test.finished, test.create_date, test.user_id]);

            await this.createAllIcons(testId);

            await this.createAllAnswers(testId);

            message.channel.send(`${url}, ${user.name}`)
        }
    }

    static async createAllIcons(testId) {

        const jsonData = [...symbols];
        const shuffledJsonData = jsonData.sort((a, b) => 0.5 - Math.random());

        for (let i = 0; i < 9; i++) {
            let icon = {
                icon_no: i+1,
                icon_id: shuffledJsonData[i].id,
                test_id: testId.insertId
            }

            usedIcons.push(shuffledJsonData[i].id);

            let queryString = 'INSERT INTO icons (icon_no, icon_id, test_id) VALUES (?, ?, ?)'
            let queryValues = [icon.icon_no, icon.icon_id, icon.test_id]

            let savedIcon = await Database.query(queryString, queryValues);
            iconIds.push({
                id: savedIcon.insertId,
                icon_id: shuffledJsonData[i].id
            })
        }
    }

    static async createAllAnswers(testId) {

        let lastNumber = 1;

        let queryString = 'INSERT INTO answers (answer_no, test_id, icons_id) VALUES '
        let queryValues = [];

        for (let i = 0; i < 100; i++) {

            let number = this.getRndInteger(0, 8);

            while (lastNumber === number) {
                number = this.getRndInteger(0, 8);
            }

            let answer = {
                answer_no: i,
                test_id: testId.insertId,
                icons_id: iconIds[number].id
            }

            queryValues.push(answer.answer_no, answer.test_id, answer.icons_id)
            queryString += '(?, ?, ?), '
            lastNumber = number;


        }

        queryString = queryString.replace(/,\s*$/, "");

        let savedAnswer = await Database.query(queryString, queryValues)

    }

    static async sendMail(user, url) {


        let transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            secureConnection: false,
            port: 587,
            tls: {ciphers: 'SSLv3'},
            auth: {
                user: process.env.EMAIL,
                pass: process.env.MAIL_PASSWORD
            }
        });

        let person = userlist.find(x => x.id === user.id)

        let info = await transporter.sendMail({
            from: '"Michel Mosberger" <michel.mosberger@stud.lgr.ch>',
            to: person.email,
            subject: 'Schlaf - Konzentrationsfähigkeit',
            html: `<p>Liebe Teilnehmerin<br>Lieber Teilnehmer<br></p>
                    Dein Test ist für dich bereit. Du kannst ihn unter <a href="https://konzentrationstest.ch/test/${url}">diesem Link</a> abrufen. Bei Fragen kannst du mir gerne eine e-Mail schreiben. Ich wünsche dir viel Erfolg dabei und rate dir davon ab, den Test auf dem Browser "FireFox" durchzuführen (Das Datum muss dort in einem speziellen Format angegeben werden).<br>Ps. Bitte führe den Test erst morgens nach dem Aufstehen durch und denke bitte daran dass die Uhrzeit im 24 Stunden Format angegeben werden sollte.</p>
                    
                    
                    <p>Beste Grüsse und vielen Dank</p>
                    
                    <p>Michel Mosberger</p>`
        })

        console.log('Message sent: %s', info.response);
    }

    static getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static generateUrl() {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 15; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

module.exports = statics