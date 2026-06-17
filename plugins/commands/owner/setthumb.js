export default {
  name: 'setthumb',
  alias: ['thumb', 'setthumbnail'],
  category: 'owner',
  emoji: '🖼️',
  desc: 'Change bot thumbnail',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('setthumb', 'Triggered', { args })
    if (!isOwner) return

    let url = args[0]
    if (!url) {
      logger.warn('setthumb', 'No URL provided')
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🖼️ THUMBNAIL 』
│
├❖ *Current:* [Image URL]
├❖ *Usage:* ${db.data.prefix}setthumb URL
│
╰❖ *${db.data.botname}* 🦚`
      })
      return
    }

    db.data.botThumbnail = url
    await db.write()
    logger.success('setthumb', `Thumbnail updated: ${url}`)

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🖼️ THUMBNAIL 』
│
├❖ *Status:* Updated
├⊸ *New image set* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
      logger.success('setthumb', 'Response sent')
    }
  }
}