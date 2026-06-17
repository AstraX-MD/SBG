export default {
  name: 'listsudo',
  alias: ['sudo'],
  category: 'owner',
  emoji: '📋',
  desc: 'List sudo users',
  isOwner: true,
  async execute(sock, m, args, db, { isOwner }) {
    logger.cmd('listsudo', 'Triggered')
    if (!isOwner) return

    try {
      const sudoList = db.data.sudo.length ? db.data.sudo.map((n, i) => `├❖ ${i + 1}. ${n}`).join('\n') : '├❖ None'

      const text = `╭❖『 📋 SUDO LIST 』
│
${sudoList}
├⊸ *Total:* ${db.data.sudo.length}
│
╰❖ *${db.data.botname}* 🦚`

      await sock.sendMessage(m.key.remoteJid, { text })
      logger.success('listsudo', 'Response sent')
    } catch (e) {
      logger.error('listsudo', 'Failed', e.message)
    }
  }
}