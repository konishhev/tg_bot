const sqlite = require('sqlite3').verbose();


class Data {
    database
    data = []

    constructor() {
        let database = new sqlite.Database('./database.db', sqlite.OPEN_READWRITE, (err) => {
            if (err) return console.log(err);
            else console.log(">> SUCCESSFULLY OPENED DATABASE");
        });
    }

    initData(id) {
        this.database.serialize(() => {
            let sql = `SELECT * FROM userData WHERE userid == ?`;
            this.database.each(sql, id, (err, row) => {
                if (err) console.log(err);
            })
        })
    }

}