'use-strict'
const { Telegraf } = require('telegraf')
const aplikasi = require('./../model/AplikasiModel')
const moment = require('moment')

const AUTHOR = process.env.AUTHOR
const BOT_TOKEN = process.env.BOT_TOKEN || ''
const bot = new Telegraf(BOT_TOKEN)


bot.on('document', async (ctx) => {

    console.log(ctx.message);
    console.log(ctx.message.caption.split(' ')[0]);
    switch (ctx.message.caption.split(' ')[0]) {
        case "add":
            console.log(ctx.message.document.file_name.split('.').pop());
            if (ctx.message.document.file_name.split('.').pop() == 'apk') {
                
                let admins = await ctx.getChatAdministrators(ctx.chat.id)
        
                const found = admins.find(e => e.user.id == ctx.message.from.id)
    
                if (found.status == 'administrator' || found.status == 'creator' || ctx.message.from.id == AUTHOR) {
                    
                    try {
                        const findApp = await aplikasi.findOne({ file_name: ctx.message.document.file_name.split('.')[0] })

                        if (!findApp) {
                            const newApp = new aplikasi({
                                file_name: ctx.message.document.file_name.split('.')[0],
                                file_id: ctx.message.document.file_id,
                                file_unique_id: ctx.message.document.file_unique_id,
                                file_size: ctx.message.document.file_size,
                                uploader_name: (ctx.message.from.username == undefined) ? ctx.message.from.first_name + ' ' + ctx.message.from.last_name : ctx.message.from.username,
                                uploader_id: ctx.message.from.id
                            })

                            newApp.save()
                            
                            ctx.reply('[ ➕ ] Aplikasi berhasil disimpan', {
                                "reply_to_message_id": ctx.message.message_id
                            })
                        } else {
                            ctx.reply('[ ✔ ] Aplikasi sudah tersimpan.', {
                                'reply_to_message_id': ctx.message.message_id,
                                'reply_markup': {
                                    'inline_keyboard': [
                                        [
                                            { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                                        ]
                                    ]
                                }
                            })
                        }
                    } catch (error) {
                        ctx.reply('[ ✖ ] Terjadi error : ' + error,{
                            'reply_to_message_id': ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                                    ]
                                ]
                            }
                        })
                    }


                } else {
                    ctx.reply('[ ✖ ] anda tidak punya akses',{
                        'reply_to_message_id': ctx.message.message_id,
                        'reply_markup': {
                            'inline_keyboard': [
                                [
                                    { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                                ]
                            ]
                        }
                    })
                    
                }
            } else {
                ctx.reply('[ ✖ ] Maaf file jenis tidak diizinkan.', {
                    'reply_to_message_id': ctx.message.message_id,
                    'reply_markup': {
                        'inline_keyboard': [
                            [
                                { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                            ]
                        ]
                    }
                })
            }
            break;
        
        case 'update':

            const tempName = ctx.message.caption.split(' ').pop()
            console.log(tempName);

                        
            if (ctx.message.document.file_name.split('.').pop() == 'apk') {
                
                let admins = await ctx.getChatAdministrators(ctx.chat.id)
        
                const found = admins.find(e => e.user.id == ctx.message.from.id)
    
                if (found.status == 'administrator' || found.status == 'creator' || ctx.message.from.id == AUTHOR) {
                    
                    try {
                        await aplikasi.findOneAndUpdate({file_name: tempName},
                            {
                                $set: {
                                    file_name: ctx.message.document.file_name.split('.')[0],
                                    file_id: ctx.message.document.file_id,
                                    file_unique_id: ctx.message.document.file_unique_id,
                                    file_size: ctx.message.document.file_size,
                                    uploader_name: (ctx.message.from.username == undefined) ? ctx.message.from.first_name + ' ' + ctx.message.from.last_name : ctx.message.from.username,
                                    uploader_id: ctx.message.from.id
                                }
                            }, {
                                new: true
                            }
                        );

                        ctx.reply('[ ➕ ] Aplikasi berhasil diubah', {
                                "reply_to_message_id": ctx.message.message_id
                        })
                        
                    } catch (error) {
                        ctx.reply('[ ✖ ] Terjadi error : ' + error,{
                            'reply_to_message_id': ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                                    ]
                                ]
                            }
                        })
                    }


                } else {
                    ctx.reply('[ ✖ ] anda tidak punya akses',{
                        'reply_to_message_id': ctx.message.message_id,
                        'reply_markup': {
                            'inline_keyboard': [
                                [
                                    { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                                ]
                            ]
                        }
                    })
                    
                }
            } else {
                ctx.reply('[ ✖ ] Maaf file jenis tidak diizinkan.', {
                    'reply_to_message_id': ctx.message.message_id,
                    'reply_markup': {
                        'inline_keyboard': [
                            [
                                { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                            ]
                        ]
                    }
                })
            }

            break
    }
})

bot.command('/listapp', async (ctx) => {

    const apps = await aplikasi.find({})

    var listArr = '🗄 Daftar aplikasi tersimpan : \n\n';
    apps.forEach((element, index) => {
         listArr += index + 1 + '.  /getapp ' + element.file_name + '\n'
    });
    ctx.replyWithHTML(listArr)
})

bot.command('/getapp', (ctx) => {
    const query = ctx.message.text;
    const pecah = query.split(' ')

    console.log(pecah);
    if (pecah[1]) {
        aplikasi.findOne({ file_name: pecah[1] }).then((res) => {

            ctx.replyWithDocument(res.file_id, {
                'reply_to_message_id': ctx.message.message_id,
                'parse_mode': 'HTML',
                'caption': `👤 uploader : <a href="tg://user?id=${res.uploader_id}">${res.uploader_name}</a> \n\n 🕒 created: ${moment(res.createdAt).format('lll')}\n 🕒 update: ${moment(res.updatedAt).format('lll')}`
            })

        }).catch((err) => {
            ctx.reply('[ ✖ ] Terjadi error : ' + error,{
                'reply_to_message_id': ctx.message.message_id,
                'reply_markup': {
                    'inline_keyboard': [
                        [
                            { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                        ]
                    ]
                }
            })
        })
    } else {

        ctx.reply('[ ✖ ] Harap masukan nama aplikasi setelah command /getapp {nama_apk}. untuk melihat nama apk /listapp', {
            'reply_to_message_id': ctx.message.message_id,
            'reply_markup': {
                'inline_keyboard': [
                    [
                        { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                    ]
                ]
            }
        })
    }
})

bot.command('/deleteapp', async (ctx) => {
    const query = ctx.message.text
    const pecah = query.split(' ').pop()
    let admins = await ctx.getChatAdministrators(ctx.chat.id)
    const found = admins.find(e => e.user.id == ctx.message.from.id)

    if (found.status == 'administrator' || found.status == 'creator' || ctx.message.from.id == AUTHOR) {
        
        aplikasi.findOneAndDelete({ file_name: pecah })
            .then((res) => {
                if (res) {
                    
                    ctx.reply("[ ✔ ] Berhasil menghapus satu aplikasi. cek /listapp", {
                        'reply_to_message_id': ctx.message.message_id
                    })
                } else {
                    ctx.reply("[ ❗ ] Aplikasi tidak ditemukan. cek /listapp", {
                        'reply_to_message_id': ctx.message.message_id
                    })
                }


            }).catch((err) => {
                ctx.reply("[ ✖ ] Terjadi error : " + err, {
                    'reply_to_message_id': ctx.message.message_id
                })
            })
    } else {
        ctx.reply('[ ✖ ] anda tidak punya akses',{
            'reply_to_message_id': ctx.message.message_id,
            'reply_markup': {
                'inline_keyboard': [
                    [
                        { text: 'Author 🤖', url: 'tg://user?id=1237885362' }
                    ]
                ]
            }
        })
    }

})

module.exports = bot

