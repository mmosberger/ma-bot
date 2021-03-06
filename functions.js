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
            subject: 'Schlaf - Konzentrationsf??higkeit',
            html: `<p>Liebe Teilnehmerin<br>Lieber Teilnehmer<br></p>
                    Dein Test ist f??r dich bereit. Du kannst ihn unter <a href="https://konzentrationstest.ch/test/${url}">diesem Link</a> abrufen. Bei Fragen kannst du mir gerne eine e-Mail schreiben. Ich w??nsche dir viel Erfolg dabei.<br><br>Ps. Bitte f??hre den Test erst morgens nach dem Aufstehen durch und denke bitte daran dass die Uhrzeit im 24 Stunden Format angegeben werden sollte.</p>
                    
                    
                    <p>Beste Gr??sse und vielen Dank</p>
                    
                    <p>Michel Mosberger</p>`
        })

        console.log('Message sent: %s', info.response);
    }


    static async checkWrongAnswers(message) {

        let tests = await Database.query('SELECT id FROM test', [])


        for (let test of tests){
            let wrongAnswersQuery = `SELECT * from answers INNER JOIN icons i on answers.icons_id = i.id where answers.user_input != i.icon_no AND answers.user_input is not NULL AND answers.test_id=?;`


            let WrongQueryString = 'UPDATE test set incorrect_answers=? WHERE id=?'
            let AnswersQueryString = 'SELECT MAX(answer_no) FROM answers WHERE test_id=? AND user_input is not NULL'
            let inputAnswersQueryString = "UPDATE test set num_answers=? WHERE id=?"

            let getAnswers = await Database.query(AnswersQueryString, [test.id])
            let req = await Database.query(wrongAnswersQuery, [test.id])

            let inputWrongAnswers = await Database.query(WrongQueryString, [req.length, test.id])
            let inputAnswers = await Database.query(inputAnswersQueryString, [getAnswers[0]["MAX(answer_no)"] + 1, test.id])
        }

        return message.channel.send("done");
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