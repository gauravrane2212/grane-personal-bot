import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'
import { DateTime } from "luxon";
const { Client } = require('pg');

const MoodObject = {
    Excited: {
        label: 'Excited 🤩',
        value: 6,
    },
    Happy: {
        label: 'Happy 🤠',
        value: 5,
    },
    Normal: {
        label: 'Normal 😐',
        value: 4,
    },
    Anxious: {
        label: 'Anxious 😓',
        value: 3,
    },
    Stressed: {
        label: 'Stressed 🤯',
        value: 2,
    },
    Sick: {
        label: 'Sick 🤮',
        value: 1,
    },
};

const MoodObjectLabelArray = Object.keys(MoodObject).map((mood) => MoodObject[mood].label);

export default class MoodHandler {
    constructor(telegram_token){
        this.token = telegram_token;
        this.bot = new Telegraf(this.token);
        this.database_client = this.connectDatabase();
    }

    setupWebhook() {
        // NOTE: Change this to the ngrok one for testing locally.
        const webhookPath = 'https://grane-personal-bot.herokuapp.com/' + this.token 
        // const webhookPath = 'https://3db63603.ngrok.io/' + this.token
        this.bot.telegram.setWebhook(webhookPath);
    }

    getWebhookCallback() {
        return this.bot.webhookCallback('/' + this.token);
    }

    sendInitialMoodReply() {
        this.bot.command('mood', (ctx) => ctx.reply('Select one that responds to your mood...', Markup.keyboard([
            [MoodObject.Excited.label, MoodObject.Happy.label],
            [MoodObject.Normal.label,  MoodObject.Anxious.label],
            [MoodObject.Stressed.label, MoodObject.Sick.label]])
            .oneTime()
            .resize()
            .extra()))
    }

    recordMood() {
        this.bot.hears(MoodObjectLabelArray, (ctx) => {
            switch(ctx.match) {
                case MoodObject.Excited.label:
                    ctx.reply('Can\`t wait to hear what\`s new with you 😎 All the best!', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Happy.label:
                    ctx.reply('Wohoooo! That\'s great to hear. Keep spreading the smiles 🎉', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Normal.label:
                    ctx.reply('Keep smiling and stay happy. Hope to see your mood improve over time 🙏🏼', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Anxious.label:
                    ctx.reply('Take some deep breaths and chillax. I will check on you again in sometime 👍', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Stressed.label:
                    ctx.reply('Always remember this is a temporary phase. You will fight through it, Champ 🧘🏽‍♂️', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Sick.label:
                    ctx.reply('Drink plenty of fluids and take some rest. Get well soon 💪🏼', Markup.removeKeyboard().extra())
                    break
            }
            this.saveMoodToDatabase(ctx.match);
        })
    }

    saveMoodToDatabase(mood) {
        this.database_client = this.connectDatabase();
        const timeZone = DateTime.local().setZone('America/New_York').toString();
        this.database_client.query('INSERT INTO mood (timestamp, mood) VALUES ($1, $2)',
            [timeZone, mood],
            (err, res) => {
            console.log(err ? err.stack : 'Recorded mood into database!')
            this.disconnectDatabase();
        });
    }

    fetchMoodDataFromDatabase() {
        this.database_client = this.connectDatabase();
        return this.database_client.query('Select * from mood order by timestamp desc');
    }

    connectDatabase() {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
        client.connect();
        return client;
    }

    disconnectDatabase() {
        this.database_client.end();
    }
}
