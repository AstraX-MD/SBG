export default async (sock, db, update) => {
  if (!db.data.antidelete?.enabled) {
    if (db.data.antidelete?.logDeletes) logger.debug('ANTIDELETE', 'Globally disabled but logging', {})
    return
  }

  const { keys } = update
  for (const key of keys) {
    const from = key.remoteJid
    const sender = key.participant || key.remoteJid
    const isBot = sender === sock.user.id

    // Anti-spam check
    if (db.data.antidelete.antiSpam) {
      global.deleteCounter = global.deleteCounter || {}
      global.deleteCounter[from] = global.deleteCounter[from] || { count: 0, time: Date.now() }
      if (Date.now() - global.deleteCounter[from].time > 60000) {
        global.deleteCounter[from] = { count: 0, time: Date.now() }
      }
      if (global.deleteCounter[from].count >= 10) {
        logger.warn('ANTIDELETE', `Anti-spam triggered for ${from}`, {})
        return
      }
      global.deleteCounter[from].count++
    }

    // Check disabled users
    if (db.data.antidelete.disabledUsers.includes(sender)) {
      logger.debug('ANTIDELETE', `User ${sender} whitelisted`, {})
      return
    }

    // Check if chat is disabled
    if (db.data.antidelete.disabledChats.includes(from)) {
      logger.debug('ANTIDELETE', `Disabled for ${from}`, {})
      return
    }

    // Check chat type
    let chatType = 'dm'
    if (from.endsWith('@g.us')) chatType = 'group'
    else if (from.endsWith('@newsletter')) chatType = 'channel'
    else if (from === 'status@broadcast') chatType = 'status'

    if (db.data.antidelete.disabledTypes.includes(chatType)) {
      logger.debug('ANTIDELETE', `Disabled for type ${chatType}`, {})
      return
    }

    // Fetch deleted message from store via the helper in index.js
    const msg = await sock.loadMessage(from, key.id)
    if (!msg) {
      logger.warn('ANTIDELETE', 'Message not found in store', { from, id: key.id })
      return
    }

    // Extract content
    let message = msg.message
    let isViewOnce = false
    if (message?.viewOnceMessageV2) {
      message = message.viewOnceMessageV2.message
      isViewOnce = true
    }
    if (message?.viewOnceMessage) {
      message = message.viewOnceMessage.message
      isViewOnce = true
    }
    if (message?.ephemeralMessage) message = message.ephemeralMessage.message
    if (message?.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message

    const msgType = Object.keys(message || {})[0] || 'unknown'
    const deletedBy = sender.split('@')[0]
    const deletedAt = new Date().toLocaleString('en-GB')
    
    let chatName = 'DM'
    if (chatType === 'group') {
      try {
        const meta = await sock.groupMetadata(from)
        chatName = meta.subject
      } catch {
        chatName = 'Group'
      }
    } else {
      chatName = chatType.toUpperCase()
    }

    // Check quoted message
    const context = message?.[msgType]?.contextInfo || message?.extendedTextMessage?.contextInfo
    const quoted = context?.quotedMessage
    const quotedSender = context?.participant?.split('@')[0] || ''

    logger.msg('ANTIDELETE', `Recovering ${msgType} from ${deletedBy}`, { from, chatType, isViewOnce, quoted: !!quoted })

    // Determine destination
    const target = db.data.antidelete.mode === 'public' ? from : db.data.antidelete.destination

    // Build recovery header
    let header = `╭❖『 🚨 ${db.data.botname} ANTIDELETE 』\n│\n├❖ *Deleted By:* @${deletedBy}\n├❖ *Chat:* ${chatName}\n├❖ *Type:* ${chatType.toUpperCase()}\n├❖ *Time:* ${deletedAt}\n├❖ *Msg Type:* ${msgType.toUpperCase()}${isViewOnce ? ' [VIEWONCE]' : ''}`
    if (quotedSender) header += `\n├❖ *Replying To:* @${quotedSender}`
    header += `\n│\n├❖ *Recovered Content:* ↓\n│\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`

    try {
      await sock.sendMessage(target, { text: header, mentions: [sender, context?.participant].filter(Boolean) })

      if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
        const text = message.conversation || message.extendedTextMessage?.text || '[Empty Text]'
        await sock.sendMessage(target, { text: `📝 *Deleted Text:*\n\n${text}` })
      }

      else if (msgType === 'imageMessage') {
        const fileSize = message.imageMessage.fileLength || 0
        if (db.data.antidelete.maxFileSize > 0 && fileSize > db.data.antidelete.maxFileSize * 1024 * 1024) {
          await sock.sendMessage(target, { text: `⚠️ *Image too large:* ${(fileSize/1024/1024).toFixed(2)}MB\n*Caption:* ${message.imageMessage.caption || 'None'}` })
        } else {
          const buffer = await sock.downloadMediaMessage(msg)
          await sock.sendMessage(target, { image: buffer, caption: message.imageMessage.caption || '[Image]' })
        }
      }

      else if (msgType === 'videoMessage') {
        const fileSize = message.videoMessage.fileLength || 0
        if (db.data.antidelete.maxFileSize > 0 && fileSize > db.data.antidelete.maxFileSize * 1024 * 1024) {
          await sock.sendMessage(target, { text: `⚠️ *Video too large:* ${(fileSize/1024/1024).toFixed(2)}MB\n*Duration:* ${message.videoMessage.seconds}s` })
        } else {
          const buffer = await sock.downloadMediaMessage(msg)
          await sock.sendMessage(target, { video: buffer, caption: message.videoMessage.caption || '[Video]' })
        }
      }

      else if (msgType === 'audioMessage') {
        const buffer = await sock.downloadMediaMessage(msg)
        await sock.sendMessage(target, { audio: buffer, ptt: message.audioMessage.ptt || false, mimetype: 'audio/mp4' })
      }

      else if (msgType === 'documentMessage') {
        const fileSize = message.documentMessage.fileLength || 0
        if (db.data.antidelete.maxFileSize > 0 && fileSize > db.data.antidelete.maxFileSize * 1024 * 1024) {
          await sock.sendMessage(target, { text: `⚠️ *Document too large:* ${(fileSize/1024/1024).toFixed(2)}MB\n*Name:* ${message.documentMessage.fileName}` })
        } else {
          const buffer = await sock.downloadMediaMessage(msg)
          await sock.sendMessage(target, { document: buffer, fileName: message.documentMessage.fileName, mimetype: message.documentMessage.mimetype })
        }
      }

      else if (msgType === 'stickerMessage') {
        const buffer = await sock.downloadMediaMessage(msg)
        await sock.sendMessage(target, { sticker: buffer })
      }

      else if (msgType === 'locationMessage') {
        await sock.sendMessage(target, { location: { degreesLatitude: message.locationMessage.degreesLatitude, degreesLongitude: message.locationMessage.degreesLongitude } })
      }

      else if (msgType === 'contactMessage') {
        await sock.sendMessage(target, { contacts: { displayName: message.contactMessage.displayName, contacts: [{ vcard: message.contactMessage.vcard }] } })
      }

      else if (msgType === 'pollCreationMessageV3') {
        const pollName = message.pollCreationMessageV3.name
        const options = message.pollCreationMessageV3.options.map(o => o.optionName).join('\n• ')
        await sock.sendMessage(target, { text: `📊 *Deleted Poll:* ${pollName}\n\n*Options:*\n• ${options}` })
      }

      else if (msgType === 'reactionMessage') {
        await sock.sendMessage(target, { text: `😀 *Deleted Reaction:* ${message.reactionMessage.text}` })
      }

      else {
        await sock.sendMessage(target, { text: `⚠️ *Unsupported type:* ${msgType}` })
      }

      logger.success('ANTIDELETE', `Recovered ${msgType} from ${deletedBy} → ${target}`, { isViewOnce, chatType })

    } catch (e) {
      logger.error('ANTIDELETE', `Failed to recover message`, e.message)
    }
  }
}