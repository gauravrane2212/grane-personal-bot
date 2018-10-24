const express = require('express')
const path = require('path')

const app = express()
const cors = require('cors')

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
  })

var port = process.env.PORT || 8080
app.listen(port)
console.log('App listening on port ' + port)