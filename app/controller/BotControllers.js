'use-strict'
const moment = require('moment')
const axios = require('axios')
const fs = require('fs')
const ytdl = require('ytdl-core')
const Utils = require('./../utils/Utils')
const apikey = process.env.PIXABAY_APIKEY || ''
const validator = require('validator')
const tesseract = require("node-tesseract-ocr")
const translate = require('@iamtraction/google-translate');
const mime = require('mime-types')

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
        
        ctx.replyWithHTML(`<b>⚙ Command : </b>` +
            `\n @${usernameBot.username} {text} - Cari photo dari pixabay inline query` +
            `\n /ytdl {url_video} - Youtube downloader` +
            `\n /list - Menampilkan daftar aplikasi` +
            `\n /app {nama_aplikasi} - Mengirim aplikasi berdasarkan nama`+
            `\n /save - Menyimpan aplikasi dari user ke database` +
            `\n /update {nama_aplikasi_baru} - Mengubah nama dari aplikasi yang tersedia` +
            `\n /delete {nama_aplikasi} - Menghapus aplikasi dari database` +
            `\n /encode {url} - Url encode` +
            `\n /decode {url} - Url decode`
            , {
                reply_to_message_id: ctx.message.message_id,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🤖 Author', url: `https://t.me/${process.env.AUTHOR_USERNAME}` },
                            { text: '📂 Repo', url: `${process.env.REPO}` },
                        ]
                    ]
                },
                
            })
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
                    msg += `👤 <a href="tg://user?id=${element.user.id}">${(element.user.username == undefined) ? element.user.first_name + ' ' + element.user.last_name : element.user.username}</a> (<b>Creator</b>)\n`
                } else if (element.status == "administrator") {
                    msg += `👤 <a href="tg://user?id=${element.user.id}">${(element.user.username == undefined) ? element.user.first_name + ' ' + element.user.last_name : element.user.username}</a> (<b>Administrator</b>)\n`
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

        const args = ctx.update.message.text.split(' ').pop();
        console.log("URL", args);

        if (!ytdl.validateURL(args)) {
            ctx.reply("Harap masukan url", {
                "reply_to_message_id": ctx.message.message_id
            })

        } else {

            const YoutubeID = ytdl.getURLVideoID(args);

            await axios.get(`http://ghodel-api.herokuapp.com/api/v1/yt/show/${YoutubeID}`)
                .then(async (res) => {
                    console.log(res.status);

                    const quality = await axios.get(res.data.watch.downloadURL)
                        .then((response) => {
                            const urlList = [];

                            response.data.format.forEach((item, index) => {
                                urlList.push({
                                    text: item.qualityLabel,
                                    url: item.downloadURL
                                })
                            })

                            return urlList;

                        }).catch(console.error)

                    ctx.telegram.sendChatAction(ctx.chat.id, 'upload_photo')
                    
                    ctx.replyWithPhoto({ url: res.data.watch.thumbnail }, {
                        reply_to_message_id: ctx.message.message_id,
                        caption: `🎥 <b>Title</b> : ${res.data.watch.title}\n 👀 <b>View</b> : ${res.data.watch.viewCount}\n 💟 <b>Likes</b> : ${res.data.watch.likes}\n 📅 <b>Published At</b> : ${res.data.watch.publishedAt}\n\n`,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [quality, [{text: 'API', url:'http://ghodel-api.herokuapp.com/'}]]
                        }
                    })

                })
                .catch(console.error)
        }
    })


    //command url 
    bot.command('/decode', (ctx) => {
        const args = ctx.update.message.text.split(' ').pop();

        ctx.reply(decodeURIComponent(args), {
                reply_to_message_id: ctx.message.message_id,
        })
        
    })

    bot.command('/encode', (ctx) => {
        const args = ctx.update.message.text.split(' ').pop();

        if (validator.isURL(args)) {
            ctx.reply(encodeURIComponent(args), {
                reply_to_message_id: ctx.message.message_id,
            })
        } else {
            ctx.reply('URL tidak valid', {
                reply_to_message_id: ctx.message.message_id,
            })
        }
    })

    //ocr 
    bot.command('/ocr', async (ctx) => {

        const args = ctx.message.text;
        const lang = args.split(' ').pop();

        const photo = ctx.message.reply_to_message.photo;
        const document = ctx.message.reply_to_message.document;
        
        const tesserOpt = {
            lang: "eng", // default
            oem: 3,
            psm: 3,
        }
        

        if (photo) {
            const qualityHD = photo[photo.length - 1];
            const imgID = qualityHD.file_id;
            const imgURL = await ctx.telegram.getFileLink(imgID)
            console.log(imgURL.href);

            try {
                const text = await tesseract.recognize(imgURL.href, tesserOpt)
                console.log("Result:", text)

                if (lang === "/ocr") {
                    ctx.reply(text, {
                            reply_to_message_id: ctx.message.message_id,
                    })
                    
                } else {
                    
                    translate(text, { to: lang }).then(res => {
                        console.log(res);
                        console.log(res.text); // OUTPUT: You are amazing!
    
                        ctx.reply(res.text, {
                            reply_to_message_id: ctx.message.message_id,
                        })
                    }).catch(err => {
                        console.log("[ERROR] translate : ", err);
                        ctx.reply("[ERROR] Server sedang ganguan...", {
                            reply_to_message_id: ctx.message.message_id,
                        })
                    });
                }


            } catch (error) {
                console.log("[ERROR] tesseract : ", error);
                ctx.reply("[ERROR] Server sedang ganguan...", {
                    reply_to_message_id: ctx.message.message_id,
                })
            }
            
        } else if (document) {
            console.log(mime.extension(document.mime_type));

            if (mime.extension(document.mime_type) === "png" || mime.extension(document.mime_type) === "jpeg" || mime.extension(document.mime_type) === "jpg") {
                const fileHD = document.file_id;
                const fileURL = await ctx.telegram.getFileLink(fileHD)
                console.log(fileURL.href);

                try {
                    const text = await tesseract.recognize(fileURL.href, tesserOpt)
                    console.log("Result:", text)

                    if (lang === "/ocr") {
                    ctx.reply(text, {
                            reply_to_message_id: ctx.message.message_id,
                    })
                    
                } else {
                    
                    translate(text, { to: lang }).then(res => {
                        console.log(res);
                        console.log(res.text); // OUTPUT: You are amazing!
    
                        ctx.reply(res.text, {
                            reply_to_message_id: ctx.message.message_id,
                        })
                    }).catch(err => {
                        console.log("[ERROR] translate : ", err);
                        ctx.reply("[ERROR] Server sedang ganguan...", {
                            reply_to_message_id: ctx.message.message_id,
                        })
                    });
                }

                } catch (error) {
                    console.log("[ERROR] tesseract : ", error);

                    ctx.reply("[ERROR] Server sedang ganguan...", {
                        reply_to_message_id: ctx.message.message_id,
                    })
                }
                
                
            } else {
                ctx.reply("[ERROR] Maaf jenis file tidak didukung...", {
                    reply_to_message_id: ctx.message.message_id,
                })
            }
        } else {
            ctx.reply("[ERROR] Maaf jenis file tidak didukung...", {
                reply_to_message_id: ctx.message.message_id,
            })

        }
    })

    //translate
    bot.command('/translate', (ctx) => {
        const args = ctx.message.text;
        const lang = args.split(' ').pop();

        const text = ctx.message.reply_to_message.text
        console.log(lang);
        

        if (text) {

            if (lang === '/translate') {
                
                translate(text, { to: 'auto' }).then(res => {
                    console.log(res);
                    console.log(res.text); // OUTPUT: You are amazing!

                    ctx.reply(res.text, {
                        reply_to_message_id: ctx.message.message_id,
                    })
                    
                }).catch(err => {
                    console.log("[ERROR] translate : ", err);

                    ctx.reply("[ERROR] Server sedang ganguan...", {
                        reply_to_message_id: ctx.message.message_id,
                    })
                });

            } else {

                translate(text, { to: lang }).then(res => {
                    console.log(res);
                    console.log(res.text); // OUTPUT: You are amazing!

                    ctx.reply(res.text, {
                        reply_to_message_id: ctx.message.message_id,
                    })
                    
                }).catch(err => {
                    console.log("[ERROR] translate : ", err);

                    ctx.reply("[ERROR] Server sedang ganguan...", {
                        reply_to_message_id: ctx.message.message_id,
                    })
                });
            }
        } else {
            ctx.reply('[ERROR] Maaf hanya mengizinkan text')
        }
    })

}