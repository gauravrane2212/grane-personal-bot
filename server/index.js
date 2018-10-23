const express = require('express')

const app = express()
const cors = require('cors')

app.use(cors())

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
  })
app.listen(process.env.PORT || 8081)