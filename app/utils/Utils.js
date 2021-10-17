'use-strict'
const axios = require('axios')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { basename } = require('path')
const { URL } = require('url')
            
const TIMEOUT = 10000


exports.download = (url, dest) => {
  const uri = new URL(url)
  if (!dest) {
    dest = basename(uri.pathname)
  }
  const pkg = url.toLowerCase().startsWith('https:') ? https : http

  return new Promise((resolve, reject) => {
    const request = pkg.get(uri.href).on('response', (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest, { flags: 'wx' })
        res
          .on('end', () => {
            file.end()
            // console.log(`${uri.pathname} downloaded to: ${path}`)
            resolve()
          })
          .on('error', (err) => {
            file.destroy()
            fs.unlink(dest, () => reject(err))
          }).pipe(file)
      } else if (res.statusCode === 302 || res.statusCode === 301) {
        // Recursively follow redirects, only a 200 will resolve.
        download(res.headers.location, dest).then(() => resolve())
      } else {
        reject(new Error(`Download request failed, response status: ${res.statusCode} ${res.statusMessage}`))
      }
    })
      request.setTimeout(TIMEOUT, function () {
      request.destroy()
      reject(new Error(`Request timeout after ${TIMEOUT / 1000.0}s`))
    })
  })
}

exports.fetchURL = async (url) => {
    
    console.log(url);
    return await axios({
        url: url,
        method: 'GET',
        timeout: 10000,
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

exports.getID = (url) => {

    var ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    }
    else {
        ID = url;
    }
    
    return ID;
}