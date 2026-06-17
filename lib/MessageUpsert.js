import { routeMessage } from './router.js'

export async function MessageUpsert(sock, db, m) {
  try {
    if (!m.message) return

    // Auto read if enabled
    if (db.data.autoRead) {
      await sock.readMessages([m.key])
    }

    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid || m.key.remoteJid
    const isBot = sender.split(':')[0].split('@')[0] === sock.user.id.split(':')[0].split('@')[0]
    const pushName = m.pushName || sender.split('@')[0]

    // EXTRACT MESSAGE - HANDLE VIEWONCE + VIEWONCEV2 + EPHEMERAL
    let message = m.message
    if (message?.viewOnceMessageV2) message = message.viewOnceMessageV2.message
    if (message?.viewOnceMessage) message = message.viewOnceMessage.message
    if (message?.ephemeralMessage) message = message.ephemeralMessage.message
    if (message?.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message

    // GET MESSAGE TYPE
    const msgType = Object.keys(message || {})[0] || 'unknown'
    const body = message?.conversation ||
                 message?.extendedTextMessage?.text ||
                 message?.imageMessage?.caption ||
                 message?.videoMessage?.caption ||
                 message?.documentMessage?.caption ||
                 message?.buttonsResponseMessage?.selectedButtonId ||
                 message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                 message?.templateButtonReplyMessage?.selectedId || ''

    const cmd = body.startsWith(db.data.prefix) ? body.split(' ')[0] : null

    // DETECT CHAT TYPE
    let chatType = 'DM'
    if (from.endsWith('@g.us')) chatType = 'GROUP'
    else if (from.endsWith('@newsletter')) chatType = 'CHANNEL'
    else if (from === 'status@broadcast') chatType = 'STATUS'

    // DETECT SPECIAL TYPES
    const isViewOnce = !!m.message?.viewOnceMessageV2 || !!m.message?.viewOnceMessage
    const isForwarded = !!message?.extendedTextMessage?.contextInfo?.isForwarded || !!message?.imageMessage?.contextInfo?.isForwarded
    const isQuoted = !!message?.extendedTextMessage?.contextInfo?.quotedMessage
    const isReaction = msgType === 'reactionMessage'
    const isPoll = msgType === 'pollCreationMessageV3' || msgType === 'pollUpdateMessage'

    // LOG EVERYTHING - EVEN BOT SELF MESSAGES
    let logLabel = `${chatType} ${msgType.toUpperCase()}`
    if (isViewOnce) logLabel += ' [VIEWONCE]'
    if (isForwarded) logLabel += ' [FORWARD]'
    if (isQuoted) logLabel += ' [REPLY]'
    if (isBot) logLabel += ' [SELF]'
    if (cmd) logLabel = cmd

    logger.incoming(from, pushName, logLabel)

    // LOG MEDIA DETAILS
    if (msgType === 'imageMessage') {
      const isVO = isViewOnce ? ' [VIEWONCE]' : ''
      logger.msg('MEDIA', `Image received${isVO}`, { from, sender: pushName, size: message.imageMessage.fileLength })
    }
    if (msgType === 'videoMessage') {
      const isVO = isViewOnce ? ' [VIEWONCE]' : ''
      logger.msg('MEDIA', `Video received${isVO}`, { from, sender: pushName, seconds: message.videoMessage.seconds })
    }
    if (msgType === 'audioMessage') {
      logger.msg('MEDIA', `Audio received`, { from, sender: pushName, ptt: message.audioMessage.ptt })
    }
    if (msgType === 'documentMessage') {
      logger.msg('MEDIA', `Document: ${message.documentMessage.fileName}`, { from, sender: pushName })
    }
    if (msgType === 'stickerMessage') logger.msg('MEDIA', 'Sticker received', { from, sender: pushName })
    if (msgType === 'locationMessage') logger.msg('MEDIA', `Location: ${message.locationMessage.degreesLatitude}`, { from, sender: pushName })
    if (msgType === 'contactMessage') logger.msg('MEDIA', `Contact: ${message.contactMessage.displayName}`, { from, sender: pushName })
    if (isPoll) logger.msg('POLL', 'Poll received', { from, sender: pushName })
    if (isReaction) logger.msg('REACTION', `Reaction: ${message.reactionMessage.text}`, { from, sender: pushName })

    // ATTACH EXTRACTED DATA TO MESSAGE OBJECT FOR ROUTER
    m.extracted = {
      message,
      msgType,
      body,
      cmd,
      chatType,
      isViewOnce,
      isForwarded,
      isQuoted,
      isBot,
      pushName,
      isReaction,
      isPoll
    }

    // ROUTE IF COMMAND - EVEN FROM BOT ITSELF
    if (cmd) {
      await routeMessage(sock, m, db)
    }

  } catch (e) {
    logger.error('MESSAGEUPSERT', `Error in MessageUpsert: ${e.message}`)
  }
}