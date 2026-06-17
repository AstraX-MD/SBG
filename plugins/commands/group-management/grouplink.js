export const desc = 'Get group invite link'

export default async (sock, m, args, db) => {
  const from = m.key.remoteJid
  if (!from.endsWith('@g.us')) return

  try {
    const code = await sock.groupInviteCode(from)
    await sock.sendMessage(from, { text: `https://chat.whatsapp.com/${code}` })
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ Failed to fetch link` })
  }
}