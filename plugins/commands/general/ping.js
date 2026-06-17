export default {
  name: 'ping',
  category: 'general',
  execute: async (m, sock) => {
    const start = Date.now()
    await sock.sendMessage(m.jid, { text: 'Pinging...' })
    const end = Date.now()
    await sock.sendMessage(m.jid, { text: `╭❖『 🏓 PONG 』
│
├❖ *Latency:* ${end - start}ms
│
╰❖ *SBG Engine* ⚡` })
  }
}
