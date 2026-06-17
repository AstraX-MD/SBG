export const desc = 'Hidden tag all members'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!db.isSudo((m.key.participant || m.key.remoteJid).split('@')[0]) || !from.endsWith('@g.us')) return

  const msg = args.join(' ')
  if (!msg) return
  
  const meta = await sock.groupMetadata(from)
  const jids = meta.participants.map(p => p.id)

  await sock.sendMessage(from, { text: msg, mentions: jids })
}