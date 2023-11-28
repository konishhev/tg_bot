const {Bot, Keyboard} = require('grammy');
const {GoogleSpreadsheet} = require('google-spreadsheet');

require('dotenv').config();

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

const dictionary = [];
let steps = [false, false];

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
    /*
    for (let i = 1; i < steps.length + 1; i++) {
        if (steps[i - 1] === false) {
            steps[i - 1] = true;
            await msg.reply(dictionary[i].response);
            break;
        }
    }
     */

    if (steps[0] === false) {
        steps[0] = true;
        await msg.reply(dictionary[1].response);
    }
    else if (steps[1] === false) {
        if (msg.message.text.length === 11 & msg.message.text.startsWith('89')) {
            steps[1] = true;npm
            await msg.reply(dictionary[2].response, {
                reply_markup: new Keyboard().text("Начнем!")
            })
        }
        else await msg.reply("Неверный формат телефона, попробуй еще");
    }
})

bot.on("message")

bot.start();