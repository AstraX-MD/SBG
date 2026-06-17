export const desc = 'Give warning to user'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  if (!db.isSudo(sender.split('@')[0]) || !from.endsWith('@g.us')) return

  let target = m.message?.extendedTextMessage?.contextInfo?.participant || 
               m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
               (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null)

  if (!target) return await sock.sendMessage(from, { text: `Usage: ${db.data.prefix}warn @tag/reply` })

  const tNum = target.split('@')[0]
  db.data.warnings[tNum] = (db.data.warnings[tNum] || 0) + 1
  await db.write()

  if (db.data.warnings[tNum] >= 3) {
    await sock.sendMessage(from, { text: `🚨 @${tNum} reached 3 warnings. Kicking...`, mentions: [target] })
    await sock.groupParticipantsUpdate(from, [target], 'remove')
    db.data.warnings[tNum] = 0
    await db.write()
  } else {
    await sock.sendMessage(from, { text: `⚠️ @${tNum} warned. [${db.data.warnings[tNum]}/3]`, mentions: [target] })
  }
}