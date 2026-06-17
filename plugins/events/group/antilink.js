export default async (sock, db, m, body) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return
  if (!db.data.antilink.includes(from)) return

  const isLink = body.match(/chat.whatsapp.com\/[a-zA-Z0-9]/gi)
  if (isLink) {
    const sender = m.key.participant || m.key.remoteJid
    const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]
    
    if (isSudo) return

    logger.msg('ANTILINK', `Link detected from @${sender.split('@')[0]}`, { from })

    try {
      await sock.sendMessage(from, { delete: m.key })
      const warnBox = `╭─⌈ ⚠️ *ANTILINK* ⌋\n├─⊷ *User:* @${sender.split('@')[0]}\n├─⊷ *Action:* Link deleted\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
      await sock.sendMessage(from, { text: warnBox, mentions: [sender] })
    } catch (e) {
      logger.error('ANTILINK', 'Failed to delete link', e.message)
    }
  }
}