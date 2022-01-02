'use-strict'
const moment = require('moment')
const aplikasi = require('./../model/AplikasiModel')
const AUTHOR = process.env.AUTHOR

exports.main = (bot) => {
    
    //menampilkan list app
    bot.command('/list', async (ctx) => {
        const apps = await aplikasi.find({})

        if (!apps.length) {
            ctx.reply('[ ✖ ] Tidak ada aplikasi tersimpan', {
                "reply_to_message_id": ctx.message.message_id,
            })
        } else {
            var listArr = '🗄 Daftar aplikasi tersimpan : \n\n';
        
            apps.forEach((element, index) => {
                if (index === 0) {
                    listArr += '╔ /app ' + element.file_name + '\n'
                } else if (index === (apps.length - 1)) {
                    listArr += '╚ /app ' + element.file_name + '\n'
                } else {
                    listArr += '╠ /app ' + element.file_name + '\n'
                }
            });
            
            ctx.replyWithHTML(listArr)
        }
    })
    
    //mendapatkan app
    bot.command('/app', (ctx) => {
        const query = ctx.message.text;
        const pecah = query.split(' ')[1];

        if (!pecah) {

            ctx.reply('[ ✖ ] Harap masukan nama aplikasi setelah command /app {nama_app}. untuk melihat nama aplikasi /list', {
                'reply_to_message_id': ctx.message.message_id
            })

        } else {
            aplikasi.findOne({ file_name: pecah }).then((data) => {

                console.log(data);
                if (data) {

                    ctx.replyWithDocument(data.file_id, {
                        'reply_to_message_id': ctx.message.message_id,
                        'parse_mode': 'HTML',
                        'caption': `👤 Uploader : <a href="tg://user?id=${data.uploader_id}">${data.uploader_name}</a> \n\n🕒 Created: ${moment(data.createdAt).format('lll')}\n🕒 Updated: ${moment(data.updatedAt).format('lll')}`,
                        'reply_markup': {
                            'inline_keyboard': [
                                [
                                    { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                ]
                            ]
                        }
                    })
                }

            }).catch((err) => {
                console.log(err);

                ctx.reply('[ ✖ ] Terjadi error : ' + err, {
                    'reply_to_message_id': ctx.message.message_id
                })
            })
        }
    })

    //mengirim ulang list app
    bot.action('app', async (ctx) => {
        
        const apps = await aplikasi.find({})

        if (!apps.length) {
            ctx.reply('[ ✖ ] Tidak ada aplikasi tersimpan')
        } else {
            var listArr = '🗄 Daftar aplikasi tersimpan : \n\n';
        
            apps.forEach((element, index) => {
                if (index === 0) {
                    listArr += '╔ /app ' + element.file_name + '\n'
                } else if (index === (apps.length - 1)) {
                    listArr += '╚ /app ' + element.file_name + '\n'
                } else {
                    listArr += '╠ /app ' + element.file_name + '\n'
                }
            });
            
            ctx.replyWithHTML(listArr)
        }
    })


    //menyimpan app
    bot.command('/save', async (ctx) => {

        const query = ctx.message.text
        const pecah = query.split(' ').pop()

        const fileName = ctx.message.reply_to_message.document.file_name.split('.').pop()

        const name = ctx.message.reply_to_message.document.file_name.split('.')[0]

        name.split(' ').join('')

        if (fileName == 'apk') {

            if (ctx.from.isAdmin || ctx.message.from.id == AUTHOR) {
                try {
                    const findApp = await aplikasi.findOne({ file_name: ctx.message.reply_to_message.document.file_name.split('.')[0] })
                    if (!findApp) {
                        const newApp = new aplikasi({
                            file_name: ctx.message.reply_to_message.document.file_name.split('.')[0],
                            file_id: ctx.message.reply_to_message.document.file_id,
                            file_unique_id: ctx.message.reply_to_message.document.file_unique_id,
                            file_size: ctx.message.reply_to_message.document.file_size,
                            uploader_name: (ctx.message.from.username == undefined) ? ctx.message.from.first_name + ' ' + ctx.message.from.last_name : ctx.message.from.username,
                            uploader_id: ctx.message.from.id
                        })
                        
                        newApp.save()
                        
                        ctx.reply('[ ➕ ] Aplikasi berhasil disimpan', {
                            "reply_to_message_id": ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                    ]
                                ]
                            }
                        })
                    
                    } else {
                        ctx.reply('[ ✔ ] Aplikasi sudah tersimpan.', {
                            'reply_to_message_id': ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                    ]
                                ]
                            }
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

    //mengupdate app
    bot.command('/update', async (ctx) => {
        const query = ctx.message.text
        const pecah = query.split(' ').pop()


        if (!pecah) {
            ctx.reply('Harap masukan nama yang ingin diupdate')
        }
        
        if (ctx.message.reply_to_message.document.file_name.split('.').pop() == 'apk') {

            if (ctx.from.isAdmin || ctx.message.from.id == AUTHOR) {

                try {
                    await aplikasi.findOneAndUpdate({ file_name: pecah },
                        {
                            $set: {
                                file_name: ctx.message.reply_to_message.document.file_name.split('.')[0],
                                file_id: ctx.message.reply_to_message.document.file_id,
                                file_unique_id: ctx.message.reply_to_message.document.file_unique_id,
                                file_size: ctx.message.reply_to_message.document.file_size,
                                uploader_name: (ctx.message.from.username == undefined) ? ctx.message.from.first_name + ' ' + ctx.message.from.last_name : ctx.message.from.username,
                                uploader_id: ctx.message.from.id
                            }
                        }, {
                            new: true
                    }
                    );
                    
                    ctx.reply('[ ➕ ] Aplikasi berhasil diubah', {
                        "reply_to_message_id": ctx.message.message_id,
                        'reply_markup': {
                            'inline_keyboard': [
                                [
                                    { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                ]
                            ]
                        }
                    })
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

    
    bot.command('/delete', async (ctx) => {
        const query = ctx.message.text
        const pecah = query.split(' ').pop()
        
        if (!pecah) {
            ctx.reply('Harap masukan nama yang ingin didelete')
        }

        if (ctx.from.isAdmin || ctx.message.from.id == AUTHOR) {
            await aplikasi.findOneAndDelete({ file_name: pecah })
                .then((res) => {
                    console.log(res);
                    if (res) {
                        ctx.reply("[ ✔ ] Berhasil menghapus satu aplikasi", {
                            'reply_to_message_id': ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                    ]
                                ]
                            }
                        })
                    } else {
                        ctx.reply("[ ❗ ] Aplikasi tidak ditemukan", {
                            'reply_to_message_id': ctx.message.message_id,
                            'reply_markup': {
                                'inline_keyboard': [
                                    [
                                        { text: 'Lihat Daftar Aplikasi', callback_data: 'app' }
                                    ]
                                ]
                            }
                        })
                    }
                
                }).catch((err) => {
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


    if (ctx.from.isAdmin || ctx.message.from.id == AUTHOR) {
            
        } else {
            ctx.reply('[ ✖ ] anda tidak punya akses', {
                'reply_to_message_id': ctx.message.message_id
            })
    }
    
}
