export async function router(m, sock, db) {
  try {
    // 1. EXTRACT ALL MESSAGE TYPES
    const type = Object.keys(m.message || {})[0]
    const isViewOnce = type === 'viewOnceMessageV2' || type === 'viewOnceMessage'
    const isViewOnce2 = type === 'viewOnceMessageV2Extension'
    const isDoc = type === 'documentMessage'
    const isSticker = type === 'stickerMessage'
    const isStatus = m.key.remoteJid === 'status@broadcast'
    const isEmoji = type === 'reactionMessage'
    const isAudio = type === 'audioMessage'
    const isVideo = type === 'videoMessage'
    const isImage = type === 'imageMessage'
    const isText = type === 'conversation' || type === 'extendedTextMessage'

    // 2. GET MESSAGE TEXT FROM ANY TYPE
    let body = ''
    if (isText) body = m.message.conversation || m.message.extendedTextMessage?.text || ''
    else if (isImage) body = m.message.imageMessage?.caption || ''
    else if (isVideo) body = m.message.videoMessage?.caption || ''
    else if (isDoc) body = m.message.documentMessage?.caption || ''
    else body = ''

    if (!body) return

    // 3. GET SENDER INFO
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = sender.split('@')[0]
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const isOwner = sender.split(':')[0] === db.data.owner?.split(':')[0] || m.key.fromMe
    const isSudo = db.isSudo(senderNum) || isOwner

    // 4. NOPREFIX LOGIC - MOST IMPORTANT
    const prefix = db.data.prefix
    let isCmd = false
    let cmdBody = body

    if (db.data.noprefix === true) {
      // NO PREFIX MODE: "ping" or ".ping" both work
      isCmd = true
      if (body.startsWith(prefix)) {
        cmdBody = body.slice(prefix.length).trim()
      } else {
        cmdBody = body.trim()
      }
    } else {
      // PREFIX ONLY MODE: must start with prefix
      if (body.startsWith(prefix)) {
        isCmd = true
        cmdBody = body.slice(prefix.length).trim()
      }
    }

    if (!isCmd || !cmdBody) return

    const args = cmdBody.split(/ +/)
    const cmdName = args.shift()?.toLowerCase()
    if (!cmdName) return

    // 5. FIND COMMAND
    const command = global.commands.get(cmdName) || global.commands.get(global.aliases.get(cmdName))
    if (!command) return

    // 6. PERMISSION CHECK
    if (db.data.mode === 'private' && !isOwner && !isSudo) return
    if (command.isOwner && !isOwner) return
    if (command.isSudo && !isSudo) return

    // 7. REACT TO COMMAND IF ENABLED
    if (db.data.reactCmd && command.emoji) {
      try {
        await sock.sendMessage(m.key.remoteJid, {
          react: { text: command.emoji, key: m.key }
        })
      } catch {}
    }

    // 8. EXECUTE - BOT REPLIES AS ITSELF
    await command.execute(sock, m, args, db.data, {
      isOwner, isSudo, isGroup, sender, senderNum, pushName: m.pushName,
      isViewOnce, isDoc, isSticker, isStatus, type, body
    })

  } catch (e) {
    console.log('[ROUTER ERROR]', e.message)
    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 ❌ ERROR 』
│
├❖ *System:* Failed
├⊸ *Try Again*
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}
