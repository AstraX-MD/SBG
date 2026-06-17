export default {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  emoji: '⚡',
  desc: 'Speed check',
  async execute(sock, m, args, db) {
    logger.cmd('ping', 'Triggered', { from: m.key.remoteJid, sender: m.pushName })
    try {
      const start = Date.now()
      const latency = Date.now() - start
      const text = `╭❖『 ⚡ PING 』
│
├❖ *${latency}ms*
├⊸ *Online* ✅
│
╰❖ *${db.data.botname}* 🦚`
      
      await sock.sendMessage(m.key.remoteJid, { text })
      logger.success('ping', 'Response sent', { to: m.key.remoteJid })
    } catch (e) {
      logger.error('ping', 'Failed', e.message)
    }
  }
}