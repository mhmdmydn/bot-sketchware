'use-strict'
const moment = require('moment')
const aplikasi = require('./../model/AplikasiModel')


exports.main = (bot) => {
    
    bot.command('/list', async (ctx) => {
        const apps = await aplikasi.find({})
        var listArr = '🗄 Daftar aplikasi tersimpan : \n\n';
        
        apps.forEach((element, index) => {
            if (index === 0) {
                listArr += '╔ /app ' + element.file_name + '\n'
            } else if (index === (data.length - 1)) {
                listArr += '╚ /app ' + element.file_name + '\n'
            } else {
                listArr += '╠ /app ' + element.file_name + '\n'
            }
        });
        
        ctx.replyWithHTML(listArr)
    })
    
    bot.command('/app', (ctx) => {
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
                console.log(err);
                ctx.reply('[ ✖ ] Terjadi error : ' + error, {
                    'reply_to_message_id': ctx.message.message_id
                })
            })
        } else {
            
            ctx.reply('[ ✖ ] Harap masukan nama aplikasi setelah command /getapp {nama_apk}. untuk melihat nama apk /listapp', {
                'reply_to_message_id': ctx.message.message_id
            })
        }
    })


    bot.command('/save', async (ctx) => {

        const fileName = ctx.message.document.file_name.split('.').pop()

        if (fileName == 'apk') {

            if (ctx.message.from.id === AUTHOR && ctx.from.isAdmin) {
                
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
                            'reply_to_message_id': ctx.message.message_id
                        })
                    }
                } catch (error) {
                    console.log(error);

                    ctx.reply('[ ✖ ] Terjadi error : ' + error, {
                        'reply_to_message_id': ctx.message.message_id
                    })
                }
            
            } else {
                ctx.reply('[ ✖ ] anda tidak punya akses', {
                    'reply_to_message_id': ctx.message.message_id
                })
            }
        } else {
            ctx.reply('[ ✖ ] Maaf file jenis tidak diizinkan.', {
                'reply_to_message_id': ctx.message.message_id
            })
        }
    })

    bot.command('/update', async (ctx) => {
        const query = ctx.message.text
        const pecah = query.split(' ').pop()

        if (!pecah) {
            ctx.reply('Harap masukan nama yang ingin diupdate')
        }
        
        if (ctx.message.document.file_name.split('.').pop() == 'apk') {
            
            if (ctx.message.from.id === AUTHOR && ctx.from.isAdmin) {
                        
                try {
                    await aplikasi.findOneAndUpdate({ file_name: pecah },
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
                    console.log(error);
                    ctx.reply('[ ✖ ] Terjadi error : ' + error, {
                        'reply_to_message_id': ctx.message.message_id
                    })
                }


            } else {
                ctx.reply('[ ✖ ] anda tidak punya akses',{
                    'reply_to_message_id': ctx.message.message_id
                })
            
            }
        } else {
            ctx.reply('[ ✖ ] Maaf file jenis tidak diizinkan.', {
                'reply_to_message_id': ctx.message.message_id
            })
        }
    })

    
    bot.command('/delete', async (ctx) => {
        const query = ctx.message.text
        const pecah = query.split(' ').pop()
        
        if (!pecah) {
            ctx.reply('Harap masukan nama yang ingin didelete')
        }

        if (ctx.message.from.id === AUTHOR && ctx.from.isAdmin) {
            aplikasi.findOneAndDelete({ file_name: pecah })
                .then((res) => {
                    console.log(res);
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
                    console.log(err);
                    console.log(err);
                    ctx.reply("[ ✖ ] Terjadi error : " + err, {
                        'reply_to_message_id': ctx.message.message_id
                    })
                })
        } else {
            ctx.reply('[ ✖ ] anda tidak punya akses', {
                'reply_to_message_id': ctx.message.message_id
            })
        }


    })
}