export default {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  emoji: '⚡',
  desc: 'Check speed',
  async execute(sock, m, args, db) {
    const start = Date.now()
    const speed = Date.now() - start
    const bars = '█'.repeat(Math.min(Math.floor(speed/100), 10))
    
    const text = `╭❖『 ⚡ PING 』
│
├❖ *Speed:* ${speed}ms
├❖ ${bars}
├⊸ *Status:* Online
│
╰❖ *${db.botname}* 🦚`
    
    await sock.sendMessage(m.key.remoteJid, { text })
  }
}