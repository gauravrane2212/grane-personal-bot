import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'
import Session from 'telegraf/session'
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
        this.bot.use(Session());
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
                    ctx.reply('Awesome News! What\'s new yo?', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Happy.label:
                    ctx.reply('Me likey it 😍 What\'s up with you, happy buoy?', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Normal.label:
                    ctx.reply('Nice, anything I need to know?', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Anxious.label:
                    ctx.reply('Awww!!! What\'s making you so uneasy?', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Stressed.label:
                    ctx.reply('Keep calm! Keep writing, I am listening, Ok?', Markup.removeKeyboard().extra())
                    break
                case MoodObject.Sick.label:
                    ctx.reply('That\'s a bummer! What\'s the status now?', Markup.removeKeyboard().extra())
                    break
            }
            ctx.session.mood = ctx.match;
        })
    }

    askReason() {
        this.bot.on('text', (ctx) => {
            const reason = ctx.update.message.text;
            const mood = ctx.session.mood;
            switch(mood) {
                case MoodObject.Excited.label:
                    ctx.reply('Now that\'s what I love to hear about you! Keep it rocking, man!', Markup.removeKeyboard().extra())
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
            this.saveMoodToDatabase(mood, reason);
        });
    }

    saveMoodToDatabase(mood,reason) {
        this.database_client = this.connectDatabase();
        const timeZone = DateTime.local().setZone('America/New_York').toString();
        this.database_client.query('INSERT INTO mood (timestamp, mood, reason) VALUES ($1, $2, $3)',
            [timeZone, mood, reason],
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
