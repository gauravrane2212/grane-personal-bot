const express = require('express')
const path = require('path')
const cors = require('cors')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
// Load env vars from .env file into process.env
require('dotenv').config()

const MoodEnum = {
  WORRIED: 'Worried 😟',
  NEUTRAL: 'Neutral 😐',
  SICK: 'Sick 🤮',
  HAPPY: 'Happy 🤠',
  DEPRESSED: 'Depressed 😵',
  EXCITED: 'Excited 🤩',
}
const MoodEnumArrayValues = Object.keys(MoodEnum).map((mood) => MoodEnum[mood])
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.command('mood', (ctx) => ctx.reply('Let\'s check in how are you feeling now, shall we?', Markup.keyboard([
  [MoodEnum.WORRIED, MoodEnum.NEUTRAL],
  [MoodEnum.SICK,  MoodEnum.HAPPY],
  [MoodEnum.DEPRESSED, MoodEnum.EXCITED]])
  .oneTime()
  .resize()
  .extra()))

bot.hears(MoodEnumArrayValues, (ctx) => {
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
})

// NOTE: Change this to the ngrok one for testing locally.
const webhookPath = 'https://grane-personal-bot.herokuapp.com/' + process.env.TELEGRAM_TOKEN 
bot.telegram.setWebhook(webhookPath);

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, '../../dist')))

app.get('/moodData', (req, res) => {
    res.send(
      [{
        title: "Sunday, October 21, 2018 - Morning",
        description: "Happy"
      },
      {
        title: "Sunday, October 21, 2018 - Noon",
        description: "Normal"
      },
      {
        title: "Sunday, October 21, 2018 - Evening",
        description: "Tensed"
      }]
    )
  }
)

app.use(bot.webhookCallback('/' + process.env.TELEGRAM_TOKEN));

var port = process.env.PORT || 8080
app.listen(port)
console.log('App listening on port ' + port)
