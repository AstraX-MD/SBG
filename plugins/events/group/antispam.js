global.spamCount = global.spamCount || {}

export default async (sock, db, m) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return
  if (!db.data.antispam.includes(from)) return

  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.data.sudo.includes(sender.split('@')[0]) || sender.split('@')[0] === db.data.owner?.split('@')[0]
  if (isSudo) return

  const now = Date.now()
  if (!global.spamCount[sender]) {
    global.spamCount[sender] = { count: 1, time: now }
    return
  }

  if (now - global.spamCount[sender].time < 5000) {
    global.spamCount[sender].count++
    if (global.spamCount[sender].count > 5) {
      logger.msg('ANTISPAM', `Spam detected from @${sender.split('@')[0]}`, { from })
      const warnBox = `╭─⌈ ⚠️ *ANTISPAM* ⌋\n├─⊷ *User:* @${sender.split('@')[0]}\n├─⊷ *Action:* Slow down!\n╰❖ *${db.data.botname} ${db.data.presents}* 🦚`
      await sock.sendMessage(from, { text: warnBox, mentions: [sender] })
      global.spamCount[sender].count = 0
    }
  } else {
    global.spamCount[sender] = { count: 1, time: now }
  }
}