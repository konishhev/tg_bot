import Data from './data.js';
import {Bot, InlineKeyboard} from 'grammy';
import {GoogleSpreadsheet} from "google-spreadsheet";
import * as dotenv from 'dotenv';

dotenv.config();

const bot = new Bot(process.env.API_KEY_BOT);
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SERVICE_TABLE_ID,
    {apiKey: process.env.GOOGLE_SERVICE_TABLE_KEY});

let dictionary = {};
let data = new Data();

const inlineStartMenu = new InlineKeyboard()
    .text("Тест", "Test")
    //.text("unit-test", "end");

const getInlineAnswerMenu = (numberOfQuestion) => {

    const inlineAnswerMenu = new InlineKeyboard();

    const keyboardButtons = [
        InlineKeyboard.text("1"),
        InlineKeyboard.text("2"),
        InlineKeyboard.text("3"),
        InlineKeyboard.text("4"),
        InlineKeyboard.text("5"),
        InlineKeyboard.text("6"),
        InlineKeyboard.text("7")
    ]

    if (data.testData[numberOfQuestion - 1] !== undefined) {
        let answer = data.testData[numberOfQuestion - 1];
        for (let i = 0; i < answer.length; i++)
            keyboardButtons[answer[i] - 1] = InlineKeyboard.text("✅ " + answer[i], "answerError");
    }


    for (let i = 0; i < dictionary['q' + numberOfQuestion].answerQuantaty; i++) inlineAnswerMenu.add(keyboardButtons[i]);

    if (numberOfQuestion > 1)
        inlineAnswerMenu.row(InlineKeyboard.text("<<", "return"));
    if ((data.testData[numberOfQuestion] !== undefined || data.testData[numberOfQuestion - 1] !== undefined)
        && numberOfQuestion < data.questionQuantity)
        inlineAnswerMenu.add(InlineKeyboard.text(">>", "next"));
    if (numberOfQuestion === data.questionQuantity) inlineAnswerMenu.add(InlineKeyboard.text("Завершить тест", "end"));

    return inlineAnswerMenu;
}

const getQuestionText = (numberOfQuestion) => {
    let object = dictionary['q' + numberOfQuestion];
    let string = object.question + '\n' + object.about + '\n' + '\n';

    for (let i = 1; i <= object.answerQuantaty; i++) {
        string += object['answer_' + i] + '\n';
    }
    return string;
}

async function loadTable() {
    await doc.loadInfo();
    return doc.sheetsByIndex[0].getRows();
}

loadTable().then(res => {
    res.reduce((obj, row) => {
        dictionary[row.get('key')] = row.get('response');
    });

    let questionsStartIterator = 11; // Номер ключа, с которого начинаются вопросы
    for (let i = questionsStartIterator; i < Object.keys(dictionary).length; i++) {
        let currentKey = 'q' + (i - questionsStartIterator + 1); // вычисление правильного ключа вопроса
        dictionary[currentKey] = JSON.parse(dictionary[currentKey]);
    }



    console.log(dictionary);
    console.log(Object.keys(dictionary).length);
})
    .then(err => console.log(err));

bot.command('start', async ctx => {

    data = new Data();

    if (await data.initData(ctx.chat.id)) {
        await ctx.reply(dictionary.comeback + data.userData[2] + '?', {
            reply_markup: inlineStartMenu
        });
    } else {
        await ctx.reply(dictionary.start);

    }
});

bot.on("message", async ctx => {

    if (!data.userRegistered && data.userData.length === 0) {
        data.userData.push(ctx.chat.id, ctx.chat.username, ctx.message.text);
        await ctx.reply(dictionary.phone);
    } else if (!data.userRegistered && data.userData.length === 3) {
        data.userData.push(ctx.message.text);
        await ctx.reply(dictionary.email);
    } else if (!data.userRegistered && data.userData.length === 4) {
        data.userData.push(ctx.message.text);
        data.insertUserData(data.userData);
        await ctx.reply(dictionary.endgreeting, {
            reply_markup: new InlineKeyboard().text("Начнем!", "Test")
        });
    } else {
        await bot.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
        await ctx.reply("А ой, прости, я удаляю все твои сообщения! ;)", {
            allow_sending_without_reply : true
        });
    }

});

bot.callbackQuery("Test", async ctx => {
    await bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
    await ctx.reply(dictionary.about, {
        reply_markup: new InlineKeyboard().text("Готов!", "ready")
    });
    await ctx.answerCallbackQuery();

})

bot.callbackQuery("ready", async ctx => {
    data.startTest();
    await bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
    await ctx.reply(getQuestionText(data.questionIterator), {
        reply_markup: getInlineAnswerMenu(data.questionIterator)
    })
    await ctx.answerCallbackQuery({
        text: "Поехали!!!"
    });
})

bot.callbackQuery('return', async ctx => {
    data.questionIterator--;
    await bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
    await ctx.reply(getQuestionText(data.questionIterator), {
        reply_markup: getInlineAnswerMenu(data.questionIterator)
    })

});

bot.callbackQuery('next', async ctx => {
    data.questionIterator++;
    await bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);
    await ctx.reply(getQuestionText(data.questionIterator), {
        reply_markup: getInlineAnswerMenu(data.questionIterator)
    })
})

bot.callbackQuery('answerError', async ctx => {
    await ctx.answerCallbackQuery("Нельзя выбрать один и тот же ответ")
})

bot.callbackQuery('end', async ctx => {
    //data.testData = ['12', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1']

    await ctx.reply("Твой тип трудовой мотивации: " + dictionary['r' + data.testResult()]);
})


bot.on('callback_query:data', async ctx => {

    let answerData = data.testData[data.questionIterator - 1];
    const howManyAnswers = dictionary['q' + data.questionIterator].choiceQuantaty;

    await bot.api.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id);

    if (answerData === undefined)
        data.testData.push(ctx.callbackQuery.data);
    else if (answerData.length < howManyAnswers)
        data.testData[data.questionIterator - 1] += ctx.callbackQuery.data;
    else {
        answerData = answerData.slice(1);
        answerData += ctx.callbackQuery.data;
        data.testData[data.questionIterator - 1] = answerData;
    }

    if (((answerData !== undefined && answerData.length === howManyAnswers - 1) || howManyAnswers === '1') &&
            data.questionIterator < data.questionQuantity)
        data.questionIterator++;

    await ctx.reply(getQuestionText(data.questionIterator), {
        reply_markup: getInlineAnswerMenu(data.questionIterator)
    });

})

bot.start();