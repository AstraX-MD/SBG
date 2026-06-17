export const desc = 'Remove member from admins'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  const sender = m.key.participant || m.key.remoteJid
  const isSudo = db.isSudo(sender.split('@')[0])
  const prefix = db.data.prefix

  if (!isSudo || !from.endsWith('@g.us')) return
  
  let target = m.message?.extendedTextMessage?.contextInfo?.participant || 
               m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
               (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null)

  if (!target) return await sock.sendMessage(from, { text: `Usage: ${prefix}demote @tag/reply` })

  try {
    await sock.groupParticipantsUpdate(from, [target], 'demote')
    await sock.sendMessage(from, { text: `✅ @${target.split('@')[0]} demoted`, mentions: [target] })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed: ${e.message}` })
  }
}