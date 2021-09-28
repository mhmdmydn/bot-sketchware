'use-strict'
const axios = require('axios')

exports.fetchURL = async (url) => {
    
    return await axios({
        url: url,
        method: 'GET',
        timeout: 8000,
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

exports.humanFileSize = (size) =>  {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

exports.searchAdmin = (nameKey, myArray) => {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].name === nameKey) {
            return myArray[i];
        }
    }
}

exports.sendMessage = (ctx, msg) => {
    ctx.reply(msg, {
        'reply_to_message_id': ctx.message.message_id,
        'reply_markup': {
                inline_keyboard: [
                    [
                        { text: "Author 🤖", url: 'tg://user?id=1237885362' }
                    ]
                ]
            }
    })
}

exports.logger = (ctx, err) => {
    ctx.telegram.sendMessage(AUTHOR, `[ X ] Ooops, encountered an error for ${ctx.updateType} :` + err)
}