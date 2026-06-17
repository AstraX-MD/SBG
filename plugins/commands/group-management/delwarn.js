export const desc = 'Remove user warnings'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0])) return

  let target = m.message?.extendedTextMessage?.contextInfo?.participant || 
               m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
               (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null)

  if (!target) return
  
  const tNum = target.split('@')[0]
  db.data.warnings[tNum] = 0
  await db.write()
  await sock.sendMessage(from, { text: `✅ Warnings reset for @${tNum}`, mentions: [target] })
}