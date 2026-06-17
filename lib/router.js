import { logCommand } from './logger.js'

export async function router(m, sock, db) {
  try {
    // 1. EXTRACT ALL MESSAGE TYPES
    const type = Object.keys(m.message || {})[0]
    const isViewOnce = type === 'viewOnceMessageV2' || type === 'viewOnceMessage'
    const isDoc = type === 'documentMessage'
    const isSticker = type === 'stickerMessage'
    const isStatus = m.key.remoteJid === 'status@broadcast'
    const isNewsletter = m.key.remoteJid.endsWith('@newsletter')

    // 2. GET MESSAGE TEXT FROM ANY TYPE
    let body = ''
    if (type === 'conversation') body = m.message.conversation
    else if (type === 'extendedTextMessage') body = m.message.extendedTextMessage.text
    else if (type === 'imageMessage') body = m.message.imageMessage.caption
    else if (type === 'videoMessage') body = m.message.videoMessage.caption
    else if (type === 'documentMessage') body = m.message.documentMessage.caption
    else body = ''

    if (!body) return

    // 3. GET SENDER INFO
    const sender = m.key.participant || m.key.remoteJid
    const senderNum = sender.split('@')[0]
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const isOwner = sender.split(':')[0] === db.data.owner?.split(':')[0] || m.key.fromMe
    const isSudo = db.isSudo(senderNum) || isOwner

    // 4. MODE FILTERING - BEFORE COMMANDS
    const mode = db.data.mode || 'public'
    let allowed = false

    if (isOwner || isSudo) {
      allowed = true
    } else {
      switch (mode) {
        case 'public': allowed = true; break
        case 'private': allowed = false; break
        case 'groups': allowed = isGroup; break
        case 'dms': allowed = !isGroup && !isNewsletter; break
        case 'channel': allowed = isNewsletter; break
        case 'silent': allowed = false; break
        case 'onlytag': allowed = body.includes(db.data.targetTag); break
        case 'onlynum': allowed = senderNum === db.data.targetNumber; break
        case 'onlyjid': allowed = m.key.remoteJid === db.data.targetJid; break
      }
    }

    if (!allowed) return

    // 5. NOPREFIX LOGIC
    const prefix = db.data.prefix
    let isCmd = false
    let cmdBody = body

    if (db.data.noprefix === true) {
      isCmd = true
      if (body.startsWith(prefix)) {
        cmdBody = body.slice(prefix.length).trim()
      } else {
        cmdBody = body.trim()
      }
    } else {
      if (body.startsWith(prefix)) {
        isCmd = true
        cmdBody = body.slice(prefix.length).trim()
      }
    }

    if (!isCmd || !cmdBody) return

    const args = cmdBody.split(/ +/)
    const cmdName = args.shift()?.toLowerCase()
    if (!cmdName) return

    const command = global.commands.get(cmdName) || global.commands.get(global.aliases.get(cmdName))
    if (!command) return

    // 6. PERMISSION CHECK
    if (command.isOwner && !isOwner) return
    if (command.isSudo && !isSudo) return

    // 7. REACT TO COMMAND
    if (db.data.cmdreact && command.emoji) {
      try {
        await sock.sendMessage(m.key.remoteJid, {
          react: { text: command.emoji, key: m.key }
        })
      } catch {}
    }

    // 8. EXECUTE
    await command.execute(sock, m, args, db, {
      isOwner, isSudo, isGroup, sender, senderNum, pushName: m.pushName,
      isViewOnce, isDoc, isSticker, isStatus, type, body
    })

    // Log command usage
    logCommand(cmdName)

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
