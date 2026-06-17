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

    // EXTRACT MESSAGE
    let message = m.message
    if (message?.viewOnceMessageV2) message = message.viewOnceMessageV2.message
    if (message?.viewOnceMessage) message = message.viewOnceMessage.message
    if (message?.ephemeralMessage) message = message.ephemeralMessage.message
    if (message?.documentWithCaptionMessage) message = message.documentWithCaptionMessage.message

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

    const isViewOnce = !!m.message?.viewOnceMessageV2 || !!m.message?.viewOnceMessage
    const isBotSelf = isBot
    
    let logLabel = `${chatType} ${msgType.toUpperCase()}`
    if (isViewOnce) logLabel += ' [VIEWONCE]'
    if (isBotSelf) logLabel += ' [SELF]'
    if (cmd) logLabel = cmd

    logger.incoming(from, pushName, logLabel)

    // ANTI-LINK & ANTI-SPAM Integration
    if (chatType === 'GROUP' && !isBotSelf) {
      const antilink = await import('../plugins/events/group/antilink.js').catch(() => null);
      if (antilink) await antilink.default(sock, db, m, body);
      
      const antispam = await import('../plugins/events/group/antispam.js').catch(() => null);
      if (antispam) await antispam.default(sock, db, m);
    }

    // ATTACH DATA
    m.extracted = { message, msgType, body, cmd, chatType, isViewOnce, isBot: isBotSelf, pushName }

    // ROUTE
    if (cmd) {
      const { routeMessage } = await import('./router.js');
      await routeMessage(sock, m, db)
    }

  } catch (e) {
    logger.error('MESSAGEUPSERT', `Error: ${e.message}`)
  }
}