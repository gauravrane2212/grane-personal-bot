import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'

const MoodEnum = {
  WORRIED: 'Worried 😟',
  NEUTRAL: 'Neutral 😐',
  SICK: 'Sick 🤮',
  HAPPY: 'Happy 🤠',
  DEPRESSED: 'Depressed 😵',
  EXCITED: 'Excited 🤩',
}
const MoodEnumArrayValues = Object.keys(MoodEnum).map((mood) => MoodEnum[mood])

export default class MoodHandler {
    constructor(telegram_token){
        this.token = telegram_token;
        this.bot = new Telegraf(this.token);
    }

    setupWebhook() {
        // NOTE: Change this to the ngrok one for testing locally.
        const webhookPath = 'https://grane-personal-bot.herokuapp.com/' + this.token 
        // const webhookPath = 'https://7b15253f.ngrok.io/' + this.token
        this.bot.telegram.setWebhook(webhookPath);
    }

    getWebhookCallback() {
        return this.bot.webhookCallback('/' + this.token);
    }

    sendMoodQuestion() {
        this.bot.command('mood', (ctx) => ctx.reply('Let\'s check in how are you feeling now, shall we?', Markup.keyboard([
            [MoodEnum.WORRIED, MoodEnum.NEUTRAL],
            [MoodEnum.SICK,  MoodEnum.HAPPY],
            [MoodEnum.DEPRESSED, MoodEnum.EXCITED]])
            .oneTime()
            .resize()
            .extra()))
    }

    recordMood() {
        this.bot.hears(MoodEnumArrayValues, (ctx) => {
        switch(ctx.match) {
            case MoodEnum.WORRIED: 
            ctx.reply('Take some deep breaths and chillax. I will check on you again in sometime 👍', Markup.removeKeyboard().extra())
            break
            case MoodEnum.NEUTRAL: 
            ctx.reply('Keep smiling and stay happy. Hope to see your mood improve over time 🙏🏼', Markup.removeKeyboard().extra())
            break
            case MoodEnum.SICK: 
            ctx.reply('Drink plenty of fluids and take some rest. Get well soon 💪🏼', Markup.removeKeyboard().extra())
            break
            case MoodEnum.HAPPY: 
            ctx.reply('Wohoooo! That\'s great to hear. Keep spreading the smiles 🎉', Markup.removeKeyboard().extra())
            break
            case MoodEnum.DEPRESSED: 
            ctx.reply('Always remember this is a temporary phase. You will fight through it, Champ 🧘🏽‍♂️', Markup.removeKeyboard().extra())
            break
            case MoodEnum.EXCITED: 
            ctx.reply('Can\`t wait to hear what\`s new with you 😎 All the best!', Markup.removeKeyboard().extra())
            break
        }
        // TODO: Save the mood info in a database
        console.log(ctx.match);
        })
    }
}
