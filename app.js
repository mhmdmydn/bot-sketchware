require('dotenv').config()
const { Telegraf } = require('telegraf')
const config = require('./app/config/database')
config();

const express = require('express')
const app = express();

const botController = require('./app/controller/BotControllers')
const aplikasiController = require('./app/controller/aplikasiController')

const URL = process.env.BASE_URL_WEBHOOK || '';
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const AUTHOR = process.env.AUTHOR
const PORT = process.env.PORT || 2002;

const bot = new Telegraf(BOT_TOKEN)
bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

bot.use(botController.main(bot))


//logging jika bot error akan mengirim ke author
bot.catch((err, ctx) => {
  ctx.telegram.sendMessage(AUTHOR, `[ X ] Ooops, encountered an error for ${ctx.updateType} :` + err)
  
})


//konfigurasi untuk menjalankn bot
bot.launch()

app.get('/', (req, res) => {
    res.send('Bot running...\n');
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

