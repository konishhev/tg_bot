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