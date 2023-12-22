import sqlite3 from 'sqlite3';
import {GoogleSpreadsheet} from "google-spreadsheet";

export default class Data {
    database;
    userRegistered;
    userData = [];  // [userid, username, name, phone, email]
    testData = [];
    questionIterator;
    questionQuantity = 23;

    /*

    constructor() {

        this.database = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) return console.log(err);
            else console.log(">> SUCCESSFULLY OPENED DATABASE");
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
            {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

    }
    */
    constructor() {
        this.database = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) return console.log(err);
            else console.log(">> SUCCESSFULLY OPENED DATABASE");
        });

        this.testData = [];
        this.userRegistered = false;

    }

    initData(id) {
        const sql = `SELECT * FROM userData WHERE userid == ?`;

        return new Promise((resolve, reject) => {
            this.database.each(sql, id, (err, row) => {
                if (err) console.error(err);
                this.userData.push(row.userid, row.username, row.name, row.phone, row.email);
                resolve(true);
            })

            setTimeout(() => {
                reject();
            }, 1000);
        }).then(onResolve => {
            this.userRegistered = true;
            console.log(this.userData);
            return true; // Пользователь найден
        }, onReject => {
            return false // Пользователь не найден
        })
    }

    insertUserData(values) {
        const sql = `INSERT INTO userData VALUES(?, ?, ?, ?, ?, null)`;
        this.database.each(sql, values, err => console.error(err));
    }

    updateUserResult(result) {
        const sql = `UPDATE userData SET result=? WHERE userid=?`;
        const data = [result, this.userData[0]];
        this.database.each(sql, data, err => console.log(err));
        console.log("DONE ---- " + data + " ----- " + this.userData[0]);
    }

    startTest() {
        this.questionIterator = 1;
    }

    testResult() {

        const results = [0, 0, 0, 0, 0];
        const keys = {
            q1: ['4', '2', '3', '1', '5'],
            q2: ['1', '3', '4', '2', '5'],
            q3: ['3', '2', '5', '4', '1'],
            q4: ['1', '2', '4', '3', '5'],
            q5: ['1', '2', '3', '5', '4'],
            q6: ['1', '0', '0', '0', '0'],
            q7: ['1', '1', '3', '3', '0'],
            q8: ['1', '3', '3', '0', '1'],
            q9: ['0', '3', '0', '0', '1'],
            q10: ['3', '3', '3', '1', '3'],
            q11: ['1', '0', '3', '0', '1'],
            q12: ['1', '1', '0', '3', '3'],
            q13: ['0', '0', '0', '1', '0'],
            q14: ['3', '3', '0', '0', '1'],
            q15: ['2', '3', '1', '1', '4'],
            q16: ['5', '2', '3', '1', '4'],
            q17: ['4', '2', '1', '3', '5'],
            q18: ['2', '4', '1', '31', '5'],
            q19: ['3', '1', '5', '2', '4'],
            q20: ['1', '2', '4', '5', '3'],
            q21: ['46', '147', '1245', '124', '25'],
            q22: ['36', '5', '2', '1', '4'],
            q23: ['46', '35', '2', '13', '78']
        };

        for (let i = 0; i < this.questionQuantity; i++) {
            const answers = this.testData[i].split("");
            const question = keys['q' + (i + 1)];
            //console.log(answers + " " + this.testData[i] + " " + this.testData);

            answers.forEach(answer => {
                console.log("--debug: " + answer + " -- " + question + " -- " + answers)
                for (let i = 0; i < question.length; i++) {
                    if (question[i].includes(answer)) {
                        console.log("INCLUDES -- " + i);
                        results[i] += 1;
                        break;
                    }
                }
            });
        }

        let maxResult = 0;
        results.forEach(result => {
            if (result > maxResult) maxResult = result;
        })

        this.updateUserResult(results.toString());

        return results.indexOf(maxResult);

    }
}