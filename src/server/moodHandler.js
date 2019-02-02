import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'
import Session from 'telegraf/session'
import { DateTime } from "luxon";
import {Moods} from '../constants.ts';
const { Client } = require('pg');

const MoodObjectLabelArray = Object.keys(Moods).map((mood) => Moods[mood].value + '|' + Moods[mood].label);

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
            [Moods.Excited.value + '|' + Moods.Excited.label, Moods.Happy.value + '|' + Moods.Happy.label],
            [Moods.Normal.value + '|' + Moods.Normal.label, Moods.Anxious.value + '|' + Moods.Anxious.label],
            [Moods.Stressed.value + '|' + Moods.Stressed.label, Moods.Sick.value + '|' + Moods.Sick.label]
        ]).oneTime().resize().extra()));
    }

    recordMood() {
        this.bot.hears(MoodObjectLabelArray, (ctx) => {
            const moodValuePlusName = ctx.match.split("|");
            switch(moodValuePlusName[1]) {
                case Moods.Excited.label:
                    ctx.reply('Awesome News! What\'s new yo?', Markup.removeKeyboard().extra())
                    break
                case Moods.Happy.label:
                    ctx.reply('Me likey it 😍 What\'s up with you, happy buoy?', Markup.removeKeyboard().extra())
                    break
                case Moods.Normal.label:
                    ctx.reply('Nice, anything I need to know?', Markup.removeKeyboard().extra())
                    break
                case Moods.Anxious.label:
                    ctx.reply('Awww!!! What\'s making you so uneasy?', Markup.removeKeyboard().extra())
                    break
                case Moods.Stressed.label:
                    ctx.reply('Keep calm! Keep writing, I am listening, Ok?', Markup.removeKeyboard().extra())
                    break
                case Moods.Sick.label:
                    ctx.reply('That\'s a bummer! What\'s the status now?', Markup.removeKeyboard().extra())
                    break
            }
            ctx.session.moodValue = moodValuePlusName[0];
            ctx.session.moodName = moodValuePlusName[1];
        })
    }

    askReason() {
        this.bot.on('text', (ctx) => {
            const reason = ctx.update.message.text;
            const moodValue = ctx.session.moodValue;
            const moodName = ctx.session.moodName;
            switch(moodName) {
                case Moods.Excited.label:
                    ctx.reply('Now that\'s what I love to hear about you! Keep it rocking, man!', Markup.removeKeyboard().extra())
                    break
                case Moods.Happy.label:
                    ctx.reply('Wohoooo! That\'s great to hear. Keep spreading the smiles 🎉', Markup.removeKeyboard().extra())
                    break
                case Moods.Normal.label:
                    ctx.reply('Keep smiling and stay happy. Hope to see your mood improve over time 🙏🏼', Markup.removeKeyboard().extra())
                    break
                case Moods.Anxious.label:
                    ctx.reply('Take some deep breaths and chillax. I will check on you again in sometime 👍', Markup.removeKeyboard().extra())
                    break
                case Moods.Stressed.label:
                    ctx.reply('Always remember this is a temporary phase. You will fight through it, Champ 🧘🏽‍♂️', Markup.removeKeyboard().extra())
                    break
                case Moods.Sick.label:
                    ctx.reply('Drink plenty of fluids and take some rest. Get well soon 💪🏼', Markup.removeKeyboard().extra())
                    break
            }
            this.saveMoodToDatabase(moodName, moodValue, reason);
        });
    }

    saveMoodToDatabase(moodName, moodValue, reason) {
        this.database_client = this.connectDatabase();
        const timeZone = DateTime.local().setZone('America/New_York').toString();
        this.database_client.query('INSERT INTO mood (timestamp, mood, reason, value) VALUES ($1, $2, $3, $4)',
            [timeZone, moodName, reason, moodValue],
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
