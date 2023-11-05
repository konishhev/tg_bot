const {Bot} = require('grammy');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

const dictionary = [];

async function loadTable() {
    await doc.loadInfo();
    return doc.sheetsByIndex[0].getRows();
}

loadTable().then(res => {
    res.reduce((obj, row) => {
        dictionary.push({
            key: row.get('key'),
            response: row.get('response')
        })
    });
    console.log(dictionary);
});

bot.command('start', async msg => {
    const response = dictionary[0];
    if (response.key == 'start') await msg.reply(response.response);
});

bot.start();