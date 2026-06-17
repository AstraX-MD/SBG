import { routeMessage } from './router.js'

export async function MessageUpsert(sock, db, m) {
  try {
    if (!m.message) return

    // Auto read if enabled
    if (db.data.autoRead) {
      await sock.readMessages([m.key])
    }

    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const msgType = Object.keys(m.message || {})[0] || 'unknown'
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || ''
    const cmd = body.startsWith(db.data.prefix) ? body.split(' ')[0] : null

    let chatType = 'DM'
    if (from.endsWith('@g.us')) chatType = 'GROUP'
    else if (from.endsWith('@newsletter')) chatType = 'CHANNEL'
    else if (from === 'status@broadcast') chatType = 'STATUS'

    // LOG EVERY MESSAGE - EVEN IF NOT COMMAND
    logger.incoming(from, sender.split('@')[0], cmd || `${chatType} ${msgType.toUpperCase()}`)

    // LOG MEDIA
    if (msgType === 'imageMessage') logger.msg('MEDIA', 'Image received', { from, sender: sender.split('@')[0] })
    if (msgType === 'videoMessage') logger.msg('MEDIA', 'Video received', { from, sender: sender.split('@')[0] })
    if (msgType === 'audioMessage') logger.msg('MEDIA', 'Audio received', { from, sender: sender.split('@')[0] })
    if (msgType === 'documentMessage') logger.msg('MEDIA', 'Document received', { from, sender: sender.split('@')[0] })
    if (msgType === 'stickerMessage') logger.msg('MEDIA', 'Sticker received', { from, sender: sender.split('@')[0] })
    if (m.message?.extendedTextMessage?.contextInfo?.isForwarded) logger.msg('FORWARD', 'Forwarded message', { from })

    // Status view if enabled
    if (m.key.remoteJid === 'status@broadcast' && db.data.statusView) {
      await sock.readMessages([m.key])
      logger.msg('STATUS', 'Viewed status from broadcast')
    }

    // NOW CHECK IF COMMAND
    if (cmd) {
      await routeMessage(sock, m, db)
    }

  } catch (e) {
    logger.error('MESSAGEUPSERT', `Error in MessageUpsert: ${e.message}`)
  }
}
