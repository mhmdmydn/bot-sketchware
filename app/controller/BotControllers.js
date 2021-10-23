'use-strict'
const moment = require('moment')
const fs = require('fs')
const ytdl = require('ytdl-core')
const Utils = require('./../utils/Utils')
const apikey = process.env.PIXABAY_APIKEY || ''


exports.main = (bot) => {

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
        
        ctx.reply(`@${usernameBot.username} {text} - Cari photo dari pixabay inline query` +
            `\n /ytdl@${usernameBot.username} {url video} - Youtube downloader`
        )
    })

    //otomatis kirim pesan jika ada member masuk grup
    bot.on('new_chat_members', (ctx) => {
        var member = ctx.message.new_chat_member.last_name == undefined ? ctx.message.new_chat_member.first_name : ctx.message.new_chat_member.first_name + ' ' + ctx.message.new_chat_member.last_name
        
        var pesan = `Selamat Datang <a href='tg://user?id=${ctx.message.new_chat_member.id}'>${member}</a> `
        pesan += `di grup <b>${ctx.chat.title}</b> \n\nSelamat berdiskusi 😊`
        
        ctx.replyWithHTML(pesan)
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
            }).catch(err => console.log(err))
    })
    
    //command list admin grup 

    bot.command('/admin', async (ctx) => {
        if (ctx.chat.type != 'private') {
            let admins = await ctx.getChatAdministrators(ctx.chat.id)
            console.log("Admin results: " + admins);

            let members = await ctx.getChatMembersCount(ctx.chat.id)
            
            var msg = `⭐<b>  ${ctx.chat.title}</b> \n`
            msg += `👥 ${members.toString()} members\n`
            msg += `➖➖➖➖➖➖➖➖➖\n`
            msg += `🔰 Pengurus Grup \n`
            
            var num = 1;
            admins.forEach((element, index) => {
                console.log(element);
                if (element.status == "creator") {
                    msg += `👥 <a href="tg://user?id=${element.user.id}">${(element.user.username == undefined) ? element.user.first_name + ' ' + element.user.last_name : element.user.username}</a> (<b>Creator</b>)\n`
                } else if (element.status == "administrator") {
                    msg += `👥 <a href="tg://user?id=${element.user.id}">${(element.user.username == undefined) ? element.user.first_name + ' ' + element.user.last_name : element.user.username}</a> (<b>Administrator</b>)\n`
                }
            });
            

            ctx.reply(msg, {
                "parse_mode": 'HTML',
                "reply_to_message_id": ctx.message.message_id
            })
        } else {
            ctx.reply("Command tidak bisa diakses dalam private chat", {
                "reply_to_message_id": ctx.message.message_id
            })
        }
    })

    //command dump info json

    bot.command('/myinfo', (ctx) => {
        ctx.reply(JSON.stringify(ctx.update, null, 4), {
            "reply_to_message_id": ctx.message.message_id
        })
    })

    //command ytdl 
    bot.command('/ytdl', async (ctx) => {
        
        const command = ctx.message.text;
        const pecah = command.split(' ')
        
        if (!pecah[1]) {
            ctx.reply('Harap masukan url youtube!!!', {
                "reply_to_message_id": ctx.message.message_id
            })
        } else {
            const info = await ytdl.getInfo(pecah[1])
            console.log(info);

            let format = await ytdl.chooseFormat(info.formats, { quality: 'lowestvideo' });
            console.log('Format found!', format);
            
            ctx.reply(format, {
                "reply_to_message_id": ctx.message.message_id
            })

        }

    })

}