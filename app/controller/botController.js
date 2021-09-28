'use-strict'
const { Telegraf } = require('telegraf')
const moment = require('moment')
const Utils = require('./../utils/Utils')
const fs = require('fs')


const AUTHOR = process.env.AUTHOR
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const bot = new Telegraf(BOT_TOKEN)


const apikey = process.env.PIXABAY_APIKEY || ''


//command start bot
bot.start((ctx) => {

    const today = new Date();
    const hour = today.getHours();

    var currentHour = moment().format("HH");

    console.log(currentHour);
    var greeting;
    
    if (hour >= 3 && hour < 12) {
        greeting = "Selamat Pagi";
    } else if (hour >= 12 && hour < 15) {
        greeting = "Selamat Siang";
    } else if (hour >= 15 && hour < 20) {
        greeting = "Selamat Sore";
    } else if (hour >= 20 && hour < 3) {
        greeting = "Selamat Malam";
    } else {
        greeting = "Hai";
    }

    const nama = ctx.from.last_name == undefined ? ctx.from.first_name : ctx.from.first_name + ' ' + ctx.from.last_name;
    ctx.replyWithMarkdown(`${greeting}, [${nama}](tg://user?id=${ctx.from.id}) 😊, Untuk bantuan ketik /help. `)

})

//command help
bot.help(async (ctx) => {
    const usernameBot = await ctx.telegram.getMe()
    
    ctx.reply(
        `@${usernameBot.username} {text} - Cari photo dari pixabay`
    )
})

//inline query untuk mencari gambar
bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query
    
    Utils.fetchURL(`https://pixabay.com/api/?key=${apikey}&q=${query}`)
        .then((res) => {
            
            const data = res.data.hits
            
            let results = data.map((item, index) => {
                return {
                    type: 'photo',
                    id: String(index),
                    photo_url: item.webformatURL,
                    thumb_url: item.previewURL,
                    caption: `[Klik disini](${item.webformatURL}) untuk membuka gambar`,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cari lagi 🔍", switch_inline_query_current_chat: query }
                                
                            ]
                        ]
                    }
                }
            })
            console.log(results);
            ctx.answerInlineQuery(results)
        
        }).catch(err => bot.telegram.sendMessage(AUTHOR, `[ X ] Ooops, encountered an error for ${ctx.updateType} :` + err))
})

bot.on('message', async (ctx) => {
    const command = ctx.message.text;
    const pecah = command.split(' ')

    switch (pecah[0]) {
        case '/admin': case '/admin@' + ctx.botInfo.username:
            if (ctx.chat.type != 'private') {
        
                let admins = await ctx.getChatAdministrators(ctx.chat.id)
                let members = await ctx.getChatMembersCount(ctx.chat.id)
                
                var msg = `⭐<b>  ${ctx.chat.title}</b> \n`
                msg += `👥 ${members.toString()} members\n`
                msg += `➖➖➖➖➖➖➖➖➖\n`
                msg += `🔰 Administrator \n`

                var num = 1;

                admins.forEach((element, index) => {
                    if (element.status == "administrator") {
                        msg += num++ +` <a href="tg://user?id=${element.user.id}">${(element.user.username == undefined) ? element.user.first_name + ' ' + element.user.last_name : element.user.username}</a>\n`
                        
                    }
                });
                
                ctx.reply(msg, {
                    "parse_mode": 'HTML',
                    "reply_to_message_id": ctx.message.message_id
                })
            }
            break
        
        case '/myinfo': case '/myinfo@' + ctx.botInfo.username:
            ctx.reply(JSON.stringify(ctx.update, null, 4), {
                "reply_to_message_id": ctx.message.message_id
            })

            break;
    
        default:
            break
    }
})

//otomatis kirim pesan jika ada member keluar grup
bot.on('left_chat_member', (ctx) => {
    //Pesan untuk yg keluar Grup
    var member = ctx.message.left_chat_member.last_name == undefined ? ctx.message.left_chat_member.first_name : ctx.message.left_chat_member.first_name + ' ' + ctx.message.left_chat_member.last_name
    
    var pesan = `Selamat Tinggal <a href='tg://user?id=${ctx.message.left_chat_member.id}'>${member}</a> ☹️`
    ctx.reply(pesan, {
        "parse_mode": 'HTML',
    })
})

module.exports = bot