const {Bot} = require('grammy');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

await doc.loadInfo();
const dictionary = await doc.sheetsByIndex[0].getRows()
    .then((response) => console.log(response));

bot.command('start', async msg => {
    await msg.reply("Hey there, what's up?");
});

bot.start();