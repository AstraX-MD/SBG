export default {
  name: 'setthumb',
  alias: ['thumb', 'setthumbnail'],
  category: 'owner',
  emoji: '🖼️',
  desc: 'Change bot thumbnail',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    if (!isOwner) return

    let url = args[0]
    if (!url && m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      // Logic to handle image upload would go here, for now use URL
    }

    if (!url) {
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

    if (db.data.confirmMsg) {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭❖『 🖼️ THUMBNAIL 』
│
├❖ *Status:* Updated
├⊸ *New image set* ✅
│
╰❖ *${db.data.botname}* 🦚`
      })
    }
  }
}
