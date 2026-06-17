export default {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  emoji: '⚡',
  desc: 'Speed check',
  async execute(sock, m, args, db) {
    const start = Date.now()
    const latency = Date.now() - start
    const text = `╭❖『 ⚡ PING 』
│
├❖ *${latency}ms*
├⊸ *Online* ✅
│
╰❖ *${db.botname}* 🦚`
    
    await sock.sendMessage(m.key.remoteJid, { text })
  }
}
