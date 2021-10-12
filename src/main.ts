import express from 'express'
import bot from './bot'

const app = express()
app.use(express.json())

app.post('/telegram', (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

app.listen(3004)
