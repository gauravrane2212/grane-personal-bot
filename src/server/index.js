import express from 'express'
import path from 'path'
import cors from 'cors'
import dotEnv from 'dotenv'
// Load env vars from .env file into process.env
dotEnv.config()

import MoodHandler from './moodHandler.js';

const handler = new MoodHandler(process.env.TELEGRAM_TOKEN);
handler.setupWebhook();
handler.sendInitialMoodReply();
handler.recordMood();
handler.askReason();

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, '../../dist')))

app.get('/moodData', (req, res) => {
  handler.fetchMoodDataFromDatabase()
    .catch(err => console.log(err))
    .then(response => {
      console.log(response.rows);
      res.send(response.rows);
      handler.disconnectDatabase();
    }); 
})

app.use(handler.getWebhookCallback());

var port = process.env.PORT || 8080
app.listen(port)
console.log('App listening on port ' + port)
