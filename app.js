require('dotenv').config()
const { Telegraf } = require('telegraf')
const config = require('./app/config/database')
config();

const express = require('express')
const app = express();


//public folder
app.use(express.static('public'))

const botController = require('./app/controller/BotControllers')
const aplikasiController = require('./app/controller/AplikasiControllers')

const URL = process.env.BASE_URL_WEBHOOK || '';
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const AUTHOR = process.env.AUTHOR
const PORT = process.env.PORT || 2002;

const bot = new Telegraf(BOT_TOKEN)
bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));



bot.use(botController.main(bot))
bot.use(aplikasiController.main(bot))


bot.use((ctx, next) => {
	if (ctx.chat.id > 0) return next()

	return ctx.telegram
		.getChatAdministrators(ctx.chat.id)
		.then(function (data) {
			if (!data || !data.length) return
			ctx.chat._admins = data
			ctx.from.isAdmin = data.some((adm) => adm.user.id === ctx.from.id)
		})
		.catch(console.log)
		.then((_) => next(ctx))
})

//logging jika bot error akan mengirim ke author
bot.catch((err, ctx) => {
  ctx.telegram.sendMessage(AUTHOR, `[ X ] Ooops, encountered an error for ${ctx.updateType} :` + err)
})


//konfigurasi untuk menjalankn bot
bot.launch().then(() => {
	console.log("[INFO] Bot has been started");
});

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

app.get('/', (req, res) => {
    res.send('Bot running...\n');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

