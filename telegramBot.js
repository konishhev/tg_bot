const {Bot} = require('grammy');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

const dictionary = {};

async function loadTable() {
    await doc.loadInfo();
    return doc.sheetsByIndex[0].getRows();
}

loadTable().then(res => {
    res.reduce((obj, row) => {
        dictionary.push({
            key: row.key,
            request: row.request,
            response: row.response
        })
    });
    console.log(dictionary);
});

bot.command('start', async msg => {
    await msg.reply("Hey there, what's up?");
});

bot.start();