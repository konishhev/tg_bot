/*
const telegramBot = require('node-telegram-bot-api');

const bot = new telegramBot(process.env.API_KEY_BOT, {

});

bot.onText(/\/start/, async message => {
    try {
        await bot.sendMessage(message.chat.id, 'BOT STARTED');
    } catch (error) {
        if (error) console.log(error);
    }
})
 */

const {Bot} = require('grammy');

const bot = new Bot(process.env.API_KEY_BOT);

bot.command('start', async msg => {
    await msg.reply("Hey there, what's up?");
});

bot.start();