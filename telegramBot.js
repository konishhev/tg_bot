const {Bot} = require('grammy');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

const dictionary = [];
const steps = [false, false];

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

bot.on("message", async msg => {
    for (let i = 1; i < steps.length + 1; i++) {
        if (steps[i - 1] === false) {
            steps[i - 1] = true;
            await msg.reply(dictionary[i].response);
        }
    }
})

bot.start();