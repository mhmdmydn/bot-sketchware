'use-strict'

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
}